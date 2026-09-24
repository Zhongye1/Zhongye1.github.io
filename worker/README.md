# blogsite-api

访客数据 API。给两处供数：

- `blog.junce.net` 友链页的点阵地图（`app/components/FriendsMap.vue` → `/api/map`）
- 侧边栏「博客统计」卡片里的访客数（`app/components/widget-right/WidgetStats.vue` → `/api/stats`）

设计依据见 [`../docs/visitor-map-design.md`](../docs/visitor-map-design.md)——那份文档里的每个决策（为什么用 D1、为什么显示代理流量、为什么按 UTC+8 切日）都对应到这里的实现。

---

## ⚠️ 部署前必读

`wrangler.jsonc` 里的 `name` 决定这次部署会不会覆盖线上跑着的东西：

| 名字 | 后果 |
|---|---|
| `blogsite-api`（当前） | 全新 Worker，现有的 `blogroll` 静态站不受影响 |
| `blogroll` | **直接覆盖**现有 Worker，`blogroll.junce.net` 会立刻变成这个 API，聚合站首页 404 |

要合二为一（一个 Worker 既托管静态站又提供 API），得先在 `wrangler.jsonc` 里加 `assets` 绑定指向聚合站的构建产物，再把 `name` 改成 `blogroll`。没做这步之前别改名字。

---

## 接口

### `POST /api/visit` — 埋点

无 body、无鉴权。所有判断都在服务端做，前端只要发一个空请求。

```js
navigator.sendBeacon('https://<域名>/api/visit')
```

响应 `204`。前端不关心结果。

### `GET /api/map?days=7` — 出图数据

`days` 只接受 `0` / `7` / `30`（`0` = 全部），其他值返回 400。响应缓存 5 分钟，带 `X-Cache: HIT|MISS`。

```jsonc
{
  "updatedAt": "2026-09-24T13:40:00Z",
  "days": 7,
  "totals": {
    "visits": 398, "uniques": 210, "cities": 41, "countries": 9,
    "byKind": { "human": 310, "proxy": 71, "crawler": 17 }
  },
  "markers": [
    {
      "id": "visitor:CN:Nanjing",
      "latitude": 32.06167,
      "longitude": 118.77778,
      "data": {
        "kind": "visitor", "name": "Nanjing", "country": "CN",
        "visits": 54, "uniques": 12, "weight": 54,
        "breakdown": { "human": 40, "proxy": 12, "crawler": 2 },
        "dominantKind": "human"
      }
    }
  ]
}
```

`markers` 的元素结构**故意等于前端的 `DottedMapMarker`**，拿到就能直接 `:markers="markers"`。

> `data.weight` 是给地图气泡用的。前端的 `clustering.ts` 需要配合改成
> `cell.count += weight`，否则 54 次访问只会显示成 `1`——原因见设计文档 4.2。

### `GET /api/stats` — 全站总数

给侧栏「博客统计」卡片的两个数字。无入参（卡片只显示全时段，时间窗是地图那条路的事），
响应同样缓存 5 分钟、带 `X-Cache`。

```jsonc
{
  "updatedAt": "2026-09-24T19:12:26.623Z",
  "totals": {
    "visitors": 232, // 访客数：COUNT(DISTINCT ip_hash)
    "visits": 620, // 访问量：SUM(visits)
  },
}
```

> ⚠️ **`visitors` 和 `/api/map` 的 `totals.uniques` 不是一个东西。**
> 表的主键是 `(ip_hash, day)`，一行 = 一个访客的一天，所以：
>
> | 口径 | 算法 | 含义 |
> |---|---|---|
> | `stats.totals.visitors` | `COUNT(DISTINCT ip_hash)` | 独立访客，同一个人来 10 天算 1 |
> | `map.totals.uniques` | `COUNT(*)` 逐城市求和 | 访客·天，同一个人来 10 天算 10 |
>
> 卡片上写「访客数」只能用前者。后者是地图的副产品（它要的是每个城市的点数），
> 拿来当访客数会虚高。两者都含 proxy / crawler，与地图口径一致。

比 `/api/map` 轻得多：一条聚合 SQL，响应几百字节，所以常驻侧栏的卡片可以放心调它，
不必为了一个数字把几百个 marker 拉回来。

---

## 全新 Worker + 新域名（api.junce.net）完整上线流程

按顺序走。每一步都能单独验证，出问题就停在那一屏，不会把线上搞坏。

### ① 建 D1 库 ✅ 已完成

```bash
npx wrangler d1 create blogroll-visits
# ✘ A database with that name already exists   ← 再跑就是这个，正常
```

库在 `2026-09-24T14:03:29Z` 就建好了，`database_id` 已回填进 `wrangler.jsonc`：

```
blogroll-visits  →  0df9dadc-95ed-42cf-8b7a-1f1533a7c6ab
```

**但它是空的**（`num_tables=0`），schema 还没灌，所以下一步不能跳。

查现有库（`wrangler d1 list` 在非交互环境会要 `CLOUDFLARE_API_TOKEN`，用 REST 更省事）：

```bash
npx wrangler d1 list
```

### ② 建表（线上）✅ 已完成

```bash
pnpm run db:remote      # = wrangler d1 execute blogroll-visits --remote --file=./schema.sql
npx wrangler d1 execute blogroll-visits --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
# 应看到 visits
```

实测库里现有 `visits`（和 D1 自己的内部表 `_cf_KV`），`SELECT COUNT(*)` 为 0。

### ③ 部署，把 Worker 建出来 ✅ 已完成

```bash
pnpm run deploy
```

部署于 `2026-09-24T14:59:06Z`。因为 `routes` 已经配好，**自定义域在同一次部署里一并生效**了，
所以 ⑤ 不用再跑一遍。

> ⚠️ **必须先部署再设 secret**。`wrangler secret put` 要求 Worker 已存在，否则会报
> `Worker not found`。反过来做会卡住。

### ④ 设 secret

> ⚠️ **别写 `openssl rand -hex 32 | npx wrangler secret put IP_SALT`。**
>
> 那样盐值当场就丢了。`wrangler secret` 是**只写**的——设进去之后
> `wrangler secret list` 只给你名字，值永远读不回来。而这个盐后面还有两处必须用到：
>
> - 算自己的 `ip_hash` 来配 `SELF_HASHES`
> - 万一以后还要重导历史数据（见文末「历史数据迁移」），盐也必须一致，
>   否则同一个 IP 在新老数据里算出两个不同的 hash，去重直接失效
>
> 所以：**先单独生成 → 存进密码管理器 → 再把已知的值喂进去。**

```bash
# ① 生成并保存（输出是一串 64 位十六进制，复制到密码管理器）
openssl rand -hex 32

# ② 把上面那串填进来。单引号，避免 shell 解释
printf '%s' '<粘贴刚才生成的盐>' | npx wrangler secret put IP_SALT

# ③ 确认名单里出现了它
npx wrangler secret list
```

可选，把自己排除掉（自己的代理会霸榜，实测单个 IP 刷了 36 次）。
**用的必须是同一个盐**：

```bash
MYIP=$(curl -s https://api.ipify.org)
HASH=$(node -e "console.log(require('node:crypto').createHmac('sha256',process.argv[1]).update(process.argv[2]).digest('hex').slice(0,16))" '<同一个盐>' "$MYIP")
printf '%s' "$HASH" | npx wrangler secret put SELF_HASHES
```

> **网络抖动**：`wrangler secret put` 走的是 Cloudflare 控制面 API，国内偶尔会
> `The request to Cloudflare's API timed out`。直接重跑同一条命令即可——
> secret 是幂等的，重复设置只是覆盖。设完记得用 `secret list` 确认，
> 超时不代表一定没写进去。

> 漏设 `IP_SALT` 不会静默出错：`POST /api/visit` 会返回 500
> （见 `src/visits.ts` 的守卫）。因为盐缺失会让**所有 IP 哈希成同一个值**，
> 那种错误不报出来几乎不可能发现。

### ⑤ 挂自定义域 ✅ 已完成

**改配置，别去 Dashboard 点。** 配置进了仓库才有记录。

`wrangler.jsonc` 里确认域名（**已配好，无需再动**）：

```jsonc
"routes": [{ "pattern": "api.junce.net", "custom_domain": true }]
```

`custom_domain: true` 会让 Cloudflare 一并完成三件事：建 DNS 记录、签发边缘证书、把域名绑到这个 Worker。**不需要你自己去 DNS 里加记录**，加了反而冲突。

> 配置里已经有 `routes` 时，这一步会**并入 ③ 的部署一起发生**，不用额外再跑一次
> `deploy`。当前就是这个情况——③ 部署完 `api.junce.net` 就已经通了。

实测结果：DNS 已解析到 `104.21.9.160` / `172.67.160.71`，TLS 校验通过，
`https://api.junce.net/` 返回 `{"service":"blogsite-api",...}`。

挂载前提（都已确认满足）：

| 前提 | 现状 |
|---|---|
| 域名所在 zone 在同一账号下 | ✅ `junce.net` 就是 |
| 该主机名**没有**已存在的 DNS 记录 | ✅ `api.junce.net` 当前 A/AAAA/CNAME 全空 |
| zone 状态正常 | ✅ active |

> ❌ **不要用 `blogroll.junce.net`**：它现在绑在旧的 `blogroll` Worker 上（给聚合站提供静态页）。
> 同一个主机名只能属于一个 Worker，硬改会让聚合站下线。

### ⑥ 验证 ✅ 已完成

```bash
# 证书签发要 1–15 分钟，这段时间访问可能是 522 / 526，属正常
dig +short api.junce.net

curl -s https://api.junce.net/                       # {"service":"blogsite-api",...}
curl -s "https://api.junce.net/api/map?days=7" | jq '.totals'
curl -s https://api.junce.net/api/stats | jq '.totals'   # {"visitors":…,"visits":…}
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://api.junce.net/api/visit   # 204

# CORS 必须是前端域名
curl -s -D - -o /dev/null -H 'Origin: https://blog.junce.net' https://api.junce.net/api/map | grep -i access-control
```

实测结果：DNS 解析到 `104.21.9.160` / `172.67.160.71`，TLS 校验通过，根路由 200，
CORS 正确回 `blog.junce.net`，`POST /api/visit` 返回 **204**。

### ⑦ 接通前端 ✅ 已完成

前端的 API 地址不在 `useVisitorMap.ts` 里写死，而是集中在 `app/site.config.ts`：
**换域名时它必须和 `wrangler.jsonc` 的 `vars.ALLOWED_ORIGINS` 一起改**，放两处迟早漏一个。

```ts
// app/site.config.ts
export const visitorApi = {
  base: 'https://api.junce.net',
  ranges: [ { value: 7, label: '7天' }, { value: 30, label: '30天' }, { value: 0, label: '全部' } ],
}
```

### ⑧ 迁历史数据 —— 已放弃

原脚本 `scripts/import-legacy.mjs` 把 Cloudflare 账号 ID 和 KV 命名空间 ID 写死在源码里，
而本仓库是公开的，所以脚本已删除，那批历史记录不再导入。见文末「历史数据迁移」。

### 可选：关掉 workers.dev 入口

`workers.dev` 在大陆访问不了，留着只是多一个入口。确认 `api.junce.net` 正常后：

```jsonc
"workers_dev": false
```

---

## 排除站长自己

自己的代理会把榜单刷满（实测单个 IP 刷了 36 次）。先查出自己的 hash 再拉黑：

```bash
# 用你的出口 IP 算 hash，和 Worker 里的算法一致
node -e "console.log(require('node:crypto').createHmac('sha256', process.argv[1]).update(process.argv[2]).digest('hex').slice(0,16))" "$IP_SALT" "$(curl -s https://api.ipify.org)"

# 逗号分隔，可以填多个
npx wrangler secret put SELF_HASHES
```

---

## 本地开发

```bash
pnpm install        # worker/ 有自己的 pnpm-workspace.yaml，不会污染根项目
pnpm run db:local   # 建本地 sqlite
pnpm run dev        # wrangler dev，默认 :8787
```

`wrangler dev` 会模拟 `request.cf`（用你本机的出口 IP 和 ISP 信息），所以 `POST /api/visit`
**是真的会入库的**，不用手工造数据就能端到端验证：

```bash
curl -X POST localhost:8787/api/visit     # 204
curl -X POST localhost:8787/api/visit     # 再发一次
pnpm run db:query "SELECT ip_hash, city, as_org, kind, visits FROM visits"
# → 只有一行，visits = 2。这就是 (ip_hash, day) 主键去重的效果：
#   换成老的 KV 实现，这里会多出两个 key。

curl -s localhost:8787/api/stats          # {"totals":{"visitors":1,"visits":2}} —— 只来过一个 IP
```

想跳过地理信息测试「无坐标」分支，直接插一行缺经纬度的数据即可。

> 注意 `pnpm run db:query` 默认打线上。本地查询要加 `--local`：
> `npx wrangler d1 execute blogroll-visits --local --command "..."`

---

## 历史数据迁移（已放弃）

线上 KV `vis_IP_track` 里那 527 条记录（2025-11 至 2026-09）**不导入 D1**：迁移脚本把
Cloudflare 账号 ID 与 KV 命名空间 ID 硬编码在源码里，而本仓库是公开的，脚本已删除。

删之前全量干跑过，结果留档：

```
527 条明细 → 233 行（独立访客·天），覆盖 54 个城市
访问量分布：human 398 / proxy 102 / crawler 27
```

> 历史记录没存 UA 和 ASN，只能按 IP 段粗分类，精度低于新数据——这是数据本身的限制。
> 代价是地图从 2026-09 之后的新数据开始积累，早期那批城市不会出现。
>
> 真要把这批数据导进来：先按 `git log` 找回脚本，再把两个 ID 改成环境变量
> （`CF_ACCOUNT_ID` / `LEGACY_KV_NAMESPACE_ID`），**不要**写回源码。

---

## 维护

```bash
npx wrangler tail                     # 实时日志
pnpm run db:query "SELECT COUNT(*) FROM visits"
pnpm run db:query "SELECT day, SUM(visits) FROM visits GROUP BY day ORDER BY day DESC LIMIT 14"
```

保留期清理（按需加 Cron Trigger）：

```sql
DELETE FROM visits WHERE day < date('now', '-2 years');
```

---

## 隐私

- **原始 IP 永不落库**。写入前就 `HMAC-SHA256(ip, IP_SALT)` 取前 16 位十六进制，之后全程只有这个哈希。
- `IP_SALT` 只存在于 Worker secret，不进仓库。泄露 = 这张匿名表可被穷举回明文 IP（IPv4 只有 2³²）。
- `/api/map` **只返回聚合结果**，永远不返回单条记录。
- 老的 `GET /api/visitors`（任何人都能拉走全部 IP+坐标）在这个 Worker 里不存在，是有意的。
