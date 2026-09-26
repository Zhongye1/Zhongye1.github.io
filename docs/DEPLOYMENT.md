# 博客部署实践

这份文档记录本站「代码怎么变成线上页面」的完整链路，以及在搭建过程中真实踩过的坑。
不是 Nuxt 部署教程，而是**这个仓库**的运维手册 —— 换个仓库照抄大概率会踩到不一样的坑。

---

## 1. 总览：什么部署在哪里

| 组件 | 平台 | 线上地址 | 部署方式 |
| --- | --- | --- | --- |
| 博客前端（Nuxt 4 静态站） | Cloudflare Pages `blog-junce` | `blog.junce.net` | **自动**（push 到 main） |
| 访客地图 API | Cloudflare Worker `blogsite-api` | `api.junce.net` | 手工 `wrangler deploy` |
| 评论后端（Twikoo） | Cloudflare Worker `twikoo` | `twikoo.junce.net` | 手工 `wrangler deploy` |
| 旧域名跳转壳 | GitHub Pages | `zhongye1.github.io` | **自动**（push 到 main） |
| DNS | Cloudflare zone `junce.net` | — | 控制台 / API |

数据层是两个 D1 库：

| 库名 | 绑定的 Worker | database_id |
| --- | --- | --- |
| `blogroll-visits` | `blogsite-api` | `0df9dadc-95ed-42cf-8b7a-1f1533a7c6ab` |
| `twikoo` | `twikoo` | `fe4acc03-ce27-4ca4-baf0-db28c6cbd411` |

**只有前端有 CI。** 两个 Worker 至今是手工部署的 —— 改完 `worker/` 或 `worker-twikoo/`
要在对应目录里自己跑 `pnpm deploy`。这是目前最大的自动化缺口。

---

## 2. 日常发布：一条命令

```bash
git push origin main
```

就这一步。后面的链路是：

```
push main
  └─ .github/workflows/deploy.yml
       ├─ pnpm install --frozen-lockfile
       ├─ pnpm generate          → .output/public（809 条路由预渲染）
       └─ cloudflare/wrangler-action@v3
            └─ pages deploy .output/public --project-name=blog-junce --branch=main
                 └─ https://blog.junce.net   ✅
```

全程约 1.5 分钟。可以在 Actions 页面手动 `workflow_dispatch` 重跑。

**前置条件**：仓库里必须存在这两个凭据，缺一个就会红在部署步（见第 5 节）。

- `secrets.CLOUDFLARE_API_TOKEN`
- `vars.CLOUDFLARE_ACCOUNT_ID`

---

## 3. 构建产物落在哪

```bash
pnpm generate     # → .output/public
```

⚠️ **仓库根目录的 `dist/` 是 `.output/public` 的符号链接**（Nuxt 4 的兼容产物），
不是真实目录。`ls dist/` 能看到完整站点，但 `find dist -name "*.html"` 会返回 0 ——
因为 `find` 默认不跟随符号链接。CI 里用的是真实路径 `.output/public`，别改成 `dist`。

产物规模参考：809 条路由预渲染、403 个 HTML、约 68 MB。

构建过程会打印**上万条 Nuxt Link Checker 警告**（trailing-slash、大写字母之类），
这是既有噪声，**0 error，不影响构建**，不要被吓到。

---

## 4. 本地命令

```bash
pnpm dev          # 开发服务器 :3000
pnpm generate     # 构建静态站
pnpm preview      # 预览生产构建
pnpm deploy       # 构建 + 直接发到 Cloudflare Pages（手工发布用）
pnpm typecheck    # vue-tsc（注意：modules/toc 下有既有报错，见第 9 节）
pnpm lint         # oxlint
```

`pnpm deploy` 用的是**全局安装的 wrangler**；CI 用的是 wrangler-action 自带的那份，
版本由 workflow 里的 `wranglerVersion` 钉死在 `4.140.0`。

---

## 5. 凭据配置

### 需要什么

| 名称 | 存放位置 | 用途 |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | 仓库 Secret | wrangler 认证 |
| `CLOUDFLARE_ACCOUNT_ID` | 仓库 Variable | 指定账号 `e566905d03f0f6cb11b2f6c6fdb43ea9` |

```bash
gh secret set CLOUDFLARE_API_TOKEN     # 交互式粘贴，值不进 shell history
gh variable set CLOUDFLARE_ACCOUNT_ID --body "<account_id>"
```

### ⚠️ 凭据类型必须认准：只有 `cfut_` 能用

Cloudflare 的凭据有前缀，**类型不同则认证方式完全不同**（[官方文档](https://developers.cloudflare.com/fundamentals/api/get-started/token-formats/)）：

| 前缀 | 类型 | 能当 `CLOUDFLARE_API_TOKEN` 用吗 |
| --- | --- | --- |
| `cfk_` | Global API Key（账号**全权**） | ❌ 它走 `X-Auth-Key` + `X-Auth-Email`，不认 Bearer |
| `cfut_` | User API Token | ✅ 正确选择 |
| `cfat_` | Account API Token | ✅ 也可 |

**这是本项目实际踩过的坑**：一开始拿了一把 `cfk_` 全局密钥，Bearer 请求全部返回
`Invalid API Token`。而且就算它能用也不该用 —— 那是能删掉整个 Cloudflare 账号的凭据，
为了部署一个静态博客把它放进 CI，风险和收益完全不成比例。

正确做法是建一把**只含 Pages 权限**的 token：

- 权限：`Account → Cloudflare Pages → Read + Write`
- 资源：限定到具体账号
- 当前在用的：名称 `github-actions-blog-junce-pages`，ID `bf218d99b5f840b7b27ebfd58b033e0a`
  （在 [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) 可随时吊销）

验证方式：直接打接口看它**该成功的能成功、该失败的会失败**。

```bash
# 应当成功
curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects"

# 应当失败（证明没越权）
curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records"
```

顺带一提：建这把 token 时是**借用**那把全局密钥的权限调 `POST /user/tokens` 铸出来的 ——
全局密钥唯一的合理用法就是这种一次性的凭据管理操作。

---

## 6. 踩过的坑（按价值排序）

### 6.1 `ERR_PNPM_IGNORED_BUILDS` —— CI 部署失败的真凶

**现象**：CI 在部署步报 `pnpm failed with exit code 1`，看起来像凭据问题，其实不是。

**原因**：`cloudflare/wrangler-action` 检测不到项目内 wrangler 时，会自己执行
`pnpm add wrangler@4.140.0`。这会拉进 `workerd`，而 `workerd` 有 postinstall 脚本 ——
pnpm 的 `allowBuilds` 策略默认拦下未授权的构建脚本，并以**退出码 1** 终止。

**修复**（两处一起才彻底）：

1. `pnpm-workspace.yaml` 的 `allowBuilds` 放行 `workerd`
2. `wrangler` 钉进根 `devDependencies` —— action 检测到已有同版本就会**跳过安装**

```yaml
# pnpm-workspace.yaml
allowBuilds:
  workerd: true
```

**注意**：不要因为「根项目其实不需要 workerd」就把它从 devDependencies 删掉又不管
allowBuilds —— 那样 `pnpm install --frozen-lockfile` 会直接 exit 1，把「安装依赖」这一步也搞挂。

### 6.2 Cloudflare Pages 项目名曾经是错的

`package.json` 里的 `deploy` 脚本一度写着 `--project-name blog-zhongye`，
而 CF 上真实项目叫 **`blog-junce`**。wrangler 会明确报 `Project not found`，
但如果没人跑过这个脚本，错误就会一直潜伏着。

### 6.3 GitHub Pages 没有服务端重定向

`zhongye1.github.io` 要跳到新站，但 GitHub Pages 是纯静态托管，**不支持 301**。
只能在 HTML 层跳。关键细节：

- 只放 `index.html` 不够。老链接（`/about/`、`/guide/xxx`）在跳转壳里没有对应文件，
  会落到 GitHub 的默认 404 页。必须**同时提供 `404.html`**，内容与 `index.html` 一致。
- 用 `location.replace()` 而非 `location.href =`：旧地址不进入历史记录，
  用户按返回键不会被弹回来形成死循环。
- 拼上 `location.pathname + search + hash` 才能保留原路径。

`.github/workflows/pages-redirect.yml` 用 `cp` 让两个文件同源，避免日后改一份漏一份。
效果实测：`zhongye1.github.io/about/?a=1#top` → `blog.junce.net/about/?a=1#top`。

> 代价：这些路径返回的 **HTTP 状态码是 404**（内容是跳转页）。对用户和 SEO 无害
> ——本来就是要让搜索引擎忘掉旧地址，页面里也带了 `noindex` 和指向新站的 `canonical`。

### 6.4 `nuxt.config.ts` 里不能 `import` 二进制资源

想把 `app/assets/ico/site.ico` 声明成 favicon，**不能**写在 `nuxt.config.ts` 的 `app.head` ——
nuxt.config 由 jiti 加载、不经过 Vite，`import` 一个 `.ico` 会直接报错。

只有走打包器的文件（插件 / 组件）才能引。所以 favicon 放在 `app/plugins/site-icon.ts` 里：

```ts
import siteIco from '@/assets/ico/site.ico'
export default defineNuxtPlugin(() => {
  useHead({ link: [{ rel: 'icon', type: 'image/x-icon', href: siteIco }] })
})
```

好处是产物 URL 带内容哈希（`/_nuxt/site.DNABdyh1.ico`），换图标不会吃到旧缓存。

### 6.5 站点标题只有一个来源

`app/site.config.ts` 的 `title` 是**唯一来源**，一处改动会同时影响：
侧边栏站点名、`<title>`（首页直接是站名，子页是 `子标题 - 站名`）、`og:site_name`、
RSS 频道名、以及 `<link rel="alternate">` 的 title。**不要在别处硬编码站名。**

标题模板的控制权在 `app/plugins/seo-title.ts` —— `nuxt-seo-utils` 会在运行时用
`%s | %siteName` 覆盖 `nuxt.config` 里配置的模板，所以必须用插件再抢回来。

---

## 7. 域名与 DNS

`junce.net` 托管在 Cloudflare（zone id `f053a937d07cbd78031b133a8b4efa30`）。

| 记录 | 指向 | 代理 |
| --- | --- | --- |
| `blog.junce.net` | `blog-junce.pages.dev` | 🟠 已代理 |
| `api.junce.net` | Worker `blogsite-api` 的 custom domain | 🟠 已代理 |
| `twikoo.junce.net` | Worker `twikoo` 的 custom domain | 🟠 已代理 |

`blog.junce.net` 是 CF Pages 项目的**自定义域**。切换托管方时要注意顺序：

1. 先在 Pages 项目上注册自定义域（状态会是 `pending`，提示 `CNAME record not set`）
2. 再把 DNS 指过去

**推荐用 `PATCH` 改现有记录，而不是删了重建** —— 后者中间有一段 NXDOMAIN 空窗：

```bash
curl -X PATCH ".../zones/$ZONE/dns_records/$RECORD_ID" \
  --data '{"type":"CNAME","name":"blog.junce.net","content":"blog-junce.pages.dev","proxied":true,"ttl":1}'
```

改完约 2 分钟内域名与证书转 `active`，证书由 Let's Encrypt 签发。

---

## 8. 回滚

### 前端回滚到某次提交

```bash
git revert <bad_commit> && git push origin main   # CI 自动重新部署
```

或在 Actions 里对历史上任意一次成功的 run 点 **Re-run** —— 会用当时的提交重新构建发布。

### 域名回滚到 GitHub Pages（应急）

1. 把 DNS 记录 `b6d135c7084f7afa166bd221c6c1c489` 改回 `CNAME → zhongye1.github.io`、`proxied: false`
2. 仓库 Settings → Pages 重新填自定义域 `blog.junce.net`
3. （可选）删掉 CF Pages 项目上的 `blog.junce.net` 自定义域

### 换掉泄漏的 token

去 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens) 吊销旧 token → 建新的
（认准 `cfut_` 前缀，权限只给 Pages Read+Write）→ `gh secret set CLOUDFLARE_API_TOKEN` → 重跑一次。

---

## 9. 排查手册

| 症状 | 先看哪 |
| --- | --- |
| CI 红在 **Install dependencies** | `workerd` 是否在 `allowBuilds` 里；`pnpm install --frozen-lockfile` 本地能否通过 |
| CI 红在 **Deploy**，报 `pnpm exit code 1` | action 是否在试图装 wrangler（`✅ Using Wrangler` 才是走了已有依赖） |
| CI 报 `necessary to set a CLOUDFLARE_API_TOKEN` | `gh secret list` 确认 secret 存在；注意 **Environment secret 不算数**，workflow 没声明对应 environment 就读不到 |
| CI 报 `Authentication error` | token 是不是 `cfk_` 开头的全局密钥（不能用 Bearer） |
| 页面 404 / 内容陈旧 | 确认部署的是哪个 Pages 项目（`wrangler pages deployment list --project-name blog-junce`） |
| 本地 `find dist` 找不到文件 | `dist` 是符号链接，用 `find -L` 或直接看 `.output/public` |
| `pnpm typecheck` 非零退出 | **已知既有问题**：`modules/toc/` 下 4 个报错（`Cannot find module '@nuxt/kit'` 等），与业务代码无关，尚未修 |
| 构建输出上万条 Link Checker 警告 | 正常噪声，0 error，忽略 |

诊断命令速查：

```bash
gh run list --limit 5                    # 最近的工作流运行
gh run view <id> --log-failed            # 只看失败步骤的日志
gh secret list && gh variable list       # 凭据是否就位
wrangler pages project list              # CF 上真实存在哪些项目
wrangler pages deployment list --project-name blog-junce
gh api repos/Zhongye1/Zhongye1.github.io/pages   # GitHub Pages 状态
```

---

## 10. 已知的缺口

按优先级：

1. **两个 Worker 没有 CI** —— 改完 `worker/`、`worker-twikoo/` 必须记得手工 `pnpm deploy`，
   容易漏。
2. **前端 workflow 没有 `paths` 过滤** —— 只改 `pages-redirect/` 或纯文档也会触发一次
   完整的 Nuxt 重建（约 1.5 分钟），属浪费。
3. **`pnpm typecheck` 无法作为 CI 门禁** —— `modules/toc/` 的既有报错没修，加了也只会一直红。
4. **`CLOUDFLARE_ACCOUNT_ID` 用的是 Variable 而非 Secret** —— 它本身不是凭据，
   这样更方便排查；但如果哪天想收紧，改成 Secret 记得同步改 workflow 里的 `vars.` 引用。
5. **main 分支有「必须走 PR」的保护规则** —— 目前的直推是靠管理员 bypass 的，
   如果哪天规则收紧，自动部署就会只在合并后触发。
