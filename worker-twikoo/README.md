# blogsite-twikoo

给 `blog.junce.net` 用的 Twikoo 2.0 评论后端：Cloudflare Workers + D1。

- 云函数地址（前端的 `envId`）：`https://twikoo.junce.net`
- Worker 名：`twikoo`；D1 库：`twikoo`（`database_id = fe4acc03-ce27-4ca4-baf0-db28c6cbd411`）
- 业务逻辑全在 `@twikoojs/common`，本目录只负责「把它跑起来」：vendor 适配器产物 + 一份 wrangler 配置

与隔壁 [`../worker/`](../worker/)（访客地图 API，`api.junce.net`）是两个独立 Worker：评论和访客统计
各自部署、各自回滚，D1 也是两个库，谁出问题都不牵连对方。

---

## 目录

| 路径                       | 作用                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| `src/index.ts`             | Worker 入口，一行转发给适配器                                                |
| `src/twikoo/index.js`      | **vendor 产物**，来自 twikoo 仓库 `packages/server-cloudflare/dist/index.js` |
| `src/stubs/unavailable.ts` | Workers 上不可用的可选依赖的替身（能解析、一碰就炸），见下文                 |
| `schema.sql`               | D1 表结构，与适配器里的 `SCHEMA_STATEMENTS` 同源                             |
| `wrangler.jsonc`           | 绑定、兼容标志、自定义域、alias                                              |

## 两个容易踩的坑

### ① 绑定名必须是 `DB`

适配器源码里读的是 `env.DB`（`src/twikoo/index.js` 的 `getD1Database`）：

```ts
const binding = env?.DB
if (!binding)
  throw new Error(
    '未绑定 D1 数据库：请在 wrangler.toml 中声明 [[d1_databases]] 并设置 binding = "DB"',
  )
```

Cloudflare 控制台在「建库」后会给你一段现成片段，但里面的 `binding` 用的是**库名**（`"twikoo"`）。
照抄进去不会构建报错，而是首个请求上抛上面那句 —— 所以这里写的是 `DB`。

### ② 公共层的惰性依赖必须能被解析，否则打包直接失败

`@twikoojs/common` 的重依赖表用的是**字面量** `import()`：

```js
const LITERAL_LOADERS = {
  nodemailer: () => import("nodemailer"),
  lokijs: () => import("lokijs"),
  …
}
```

字面量是刻意为之（specifier 一旦是变量就无法被静态追踪，依赖会漏进产物），代价是
**打包器必须解析得到每一个 specifier**，哪怕那条分支在 Workers 上永远不执行 ——
否则 esbuild 抛 16 个 `Could not resolve`，`wrangler deploy` 直接失败。

处理办法分两类：

| 类别               | 依赖                                                                                                                                                        | 做法                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 本平台真会用到     | `marked` `bowser` `html-to-text` `xml2js` `pushoo` `xss`                                                                                                    | 装进 `dependencies`                                      |
| 本平台没有可用形态 | `nodemailer` `jsdom` `dompurify` `@imaegoo/node-ip2region` `akismet-api` `tencentcloud-sdk-nodejs-tms` `form-data` `@xsai/generate-text` `mongodb` `lokijs` | `wrangler.jsonc` 的 `alias` → `src/stubs/unavailable.ts` |

第二类里的每一个都有适配器的 `setCustomLibs` 覆写顶在前面（邮件走 HTTP 通道、XSS 走
`xss` 白名单、属地走 `request.cf`），`mongodb` / `lokijs` 则是本平台不上场的本地库模式。

> stub **故意不是静默空对象**：覆写一旦失效（比如上游改了 `setCustomLibs` 的键名），
> 静默 stub 会把故障退化成「邮件悄悄不发」；抛错则会在首个请求上直接暴露。

## 本地开发

```bash
pnpm install
pnpm db:local        # 把 schema.sql 灌进本地 D1（miniflare 的 sqlite）
pnpm dev             # http://127.0.0.1:8787
```

自测（云函数的「我在正常工作」响应就是这个）：

```bash
curl -s -X POST http://127.0.0.1:8787/ -H 'Content-Type: application/json' -d '{}'
# {"code":100,"message":"Twikoo 云函数运行正常，请参考 https://twikoo.js.org/frontend.html 完成前端的配置","version":"2.0.9"}

curl -s -X POST http://127.0.0.1:8787/ -H 'Content-Type: application/json' -d '{"event":"GET_FUNC_VERSION"}'
# {"code":0,"version":"2.0.9","accessToken":"…"}
```

## 部署

```bash
# ① 线上建表（库已建好；这一步是灌表，幂等，重复跑没事）
pnpm db:remote
wrangler d1 execute twikoo --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
# 应看到 comment / counter / config / cap_kv

# ② 部署。routes 已配好，自定义域与证书会在同一次部署里一并生效
pnpm deploy
```

验证：

```bash
curl -s -X POST https://twikoo.junce.net/ -H 'Content-Type: application/json' -d '{}'
# → Twikoo 云函数运行正常…

curl -s -X POST https://twikoo.junce.net/ -H 'Content-Type: application/json' -d '{"event":"GET_FUNC_VERSION"}'
curl -s -X POST https://twikoo.junce.net/ -H 'Content-Type: application/json' -d '{"event":"GET_CONFIG"}'
```

`custom_domain: true` 要 Cloudflare 建 DNS、签边缘证书、绑 Worker，证书签发要 1–15 分钟，
这段时间 `522` / `526` 属正常。前提：`twikoo.junce.net` 这个主机名**没有**已存在的
DNS 记录、也没被别的 Worker 占用。

> `wrangler dev` / 部署若报 `EROFS: read-only file system, open '…/.wrangler/registry/…'`，
> 是沙箱把 `~/.config/.wrangler` 挂成了只读，与仓库无关：换一个有写权限的环境跑即可。

## 前端接入

评论前端还没接（本轮只做后端）。接入时把云函数地址填到初始化参数：

```js
twikoo.init({
  envId: 'https://twikoo.junce.net',
  el: '#twikoo',
})
```

建议照 `visitorApi` 的做法在 `app/site.config.ts` 里加一项常量，别把域名散落在组件里。

## 重新 vendor 适配器

`@twikoojs/cloudflare` 目前 `private: true`、未发布 npm，所以只能搬产物：

```bash
# 在 twikoo 仓库里先构建
cd ~/Desktop/Blog/twikoo && pnpm install && pnpm build

# 回到本目录搬过来（默认就找 ../Blog/twikoo，也可显式传路径）
cd worker-twikoo && pnpm vendor
pnpm typecheck && pnpm dev     # 验一遍
```

`pnpm vendor` 会重写产物头部注释、覆盖 `schema.sql`，并提醒你核对
`package.json` 里 `@twikoojs/common` 的版本与上游 `packages/server-common/package.json` 是否一致
（产物与公共层版本错配时，接口形态可能对不上）。

## 能力边界（Cloudflare 行）

| 能力                 | 状态    | 说明                                                                         |
| -------------------- | ------- | ---------------------------------------------------------------------------- |
| 邮件通知             | ⚠️ 受限 | 只能走 SendGrid / MailChannels / Resend 的 HTTP API（Workers 无裸 TCP SMTP） |
| 评论消毒             | ✅      | `xss` 白名单垫片（1.x 同款）                                                 |
| IP 属地              | ✅      | `request.cf` + 随评论落库的 `ipRegion`，不装 8.33 MB 的 ip2region db         |
| 图片上传             | ✅      | S3 兼容图床（R2 的 S3 端点）                                                 |
| 验证码               | ✅      | 内嵌 Cap，默认关闭                                                           |
| akismet / 腾讯云 TMS | ❌      | SDK 依赖 Node `http` 与长连接                                                |
| AI                   | ❌      | 未引入 `@xsai/*`                                                             |

邮件、图床这些要等用到再配：`SMTP_SERVICE` / `SMTP_PASS` / `SENDER_EMAIL` 等按需
`wrangler secret put`（注意 `wrangler secret put` 要求 Worker 已存在，得先 `pnpm deploy` 一次）。

## 产物体积

干跑实测（wrangler 4.140.0）：**906.72 KiB / gzip 204.94 KiB**，在 Workers 免费套餐
（gzip 3 MiB）以内。
