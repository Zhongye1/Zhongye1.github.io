import { classify } from './classify'
import { hashIp } from './hash'
import type { Env } from './types'

/**
 * 一次访问的全部输入。
 *
 * 刻意用朴素对象而不是 `Request`：这一层不该知道 HTTP 的存在，
 * 拆包的动作留在路由层，这样 recordVisit 不构造 Request 也能测。
 */
export interface VisitInput {
  ip: string
  userAgent: string
  country?: string | undefined
  region?: string | undefined
  city?: string | undefined
  latitude?: number | undefined
  longitude?: number | undefined
  asn?: number | undefined
  asOrganization?: string | undefined
}

export type VisitOutcome = 'recorded' | 'self' | 'no-geo'

/** 按 UTC+8 切日。用 UTC 会让「最近 7 天」和直觉差 8 小时。 */
export function shanghaiDay(at: Date): string {
  return new Date(at.getTime() + 8 * 3_600_000).toISOString().slice(0, 10)
}

function selfHashes(env: Env): Set<string> {
  return new Set(
    (env.SELF_HASHES ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  )
}

/**
 * 去重靠主键 (ip_hash, day)，自增靠 ON CONFLICT。
 *
 * 地理字段跟着最新一次走：同一个 IP 隔天换了出口（家庭宽带重播、切了代理节点），
 * 让旧位置一直挂着没有意义。
 */
const UPSERT = `
  INSERT INTO visits (
    ip_hash, day, country, region, city, latitude, longitude,
    asn, as_org, kind, visits, first_seen, last_seen
  ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 1, ?11, ?11)
  ON CONFLICT (ip_hash, day) DO UPDATE SET
    visits    = visits + 1,
    last_seen = excluded.last_seen,
    country   = excluded.country,
    region    = excluded.region,
    city      = excluded.city,
    latitude  = excluded.latitude,
    longitude = excluded.longitude,
    asn       = excluded.asn,
    as_org    = excluded.as_org,
    kind      = excluded.kind
`

/**
 * 记录一次访问。调用方只要给输入，去重、分类、匿名化、自过滤都在这里面。
 *
 * 返回 outcome 而不是布尔：路由层可以据此区分「正常入库」和「被静默跳过」，
 * 排查时不用猜。
 */
export async function recordVisit(
  env: Env,
  input: VisitInput,
  at: Date = new Date(),
): Promise<VisitOutcome> {
  // 缺盐必须当场炸掉，不能往下走。
  //
  // env.IP_SALT 的类型是 string，所以 TypeScript 拦不住「secret 忘了设」；
  // 而 TextEncoder.encode(undefined) 会把字符串 "undefined" 编进去，
  // 结果是**所有 IP 哈希成同一个值** —— 去重会以为全站只有一个人，
  // 地图上只剩一个点，却没有任何报错。这种静默错误比 500 难查得多。
  if (!env.IP_SALT) {
    throw new Error('缺少 IP_SALT secret，先跑：npx wrangler secret put IP_SALT')
  }

  const ipHash = await hashIp(input.ip, env.IP_SALT)

  // 站长自己不计入。实测单个代理 IP 能刷出 36 次访问，
  // 不排掉的话榜单前排永远是自己。
  if (selfHashes(env).has(ipHash)) return 'self'

  // 没有城市和坐标就画不出点，存下来只是噪音。线上 527 条记录 100% 有值，
  // 这是兜底分支而不是常态。
  if (!input.city || input.latitude === undefined || input.longitude === undefined) {
    return 'no-geo'
  }

  const kind = classify({
    ip: input.ip,
    userAgent: input.userAgent,
    asn: input.asn,
    asOrganization: input.asOrganization,
  })
  const now = at.toISOString()

  await env.DB.prepare(UPSERT)
    .bind(
      ipHash,
      shanghaiDay(at),
      input.country ?? null,
      input.region ?? null,
      input.city,
      input.latitude,
      input.longitude,
      input.asn ?? null,
      input.asOrganization ?? null,
      kind,
      now,
    )
    .run()

  return 'recorded'
}
