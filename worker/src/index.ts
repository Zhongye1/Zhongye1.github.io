import { readMap } from './map'
import { recordVisit } from './visits'
import type { Env, MapRange } from './types'

/**
 * 路由层。刻意保持很薄：只做方法/路径分发、来源校验、缓存和拆包，
 * 业务全在 visits.ts / map.ts 里。这一层没有任何 D1 和 request.cf 的知识。
 */

const ALLOWED_RANGES = new Set<number>([0, 7, 30])
const MAP_CACHE_SECONDS = 300
const JSON_TYPE = 'application/json; charset=utf-8'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const cors = corsHeaders(env, request.headers.get('origin'))

    // sendBeacon 发的是 simple request 不会预检，但前端 $fetch 拉地图会带
    // Content-Type，所以 OPTIONS 必须接住
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (url.pathname === '/api/visit' && request.method === 'POST') {
      return handleVisit(request, env, cors)
    }

    if (url.pathname === '/api/map' && request.method === 'GET') {
      return handleMap(url, env, ctx, cors)
    }

    if (url.pathname === '/') {
      return Response.json(
        { service: 'blogsite-api', endpoints: ['/api/visit', '/api/map'] },
        { headers: cors },
      )
    }

    return new Response('Not Found', { status: 404, headers: cors })
  },
} satisfies ExportedHandler<Env>

/**
 * 只回显白名单里的来源，不用 `*`。
 *
 * 必须带 `Vary: Origin`，否则中间缓存会把 A 站的响应连 CORS 头一起发给 B 站。
 */
function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (!origin || !allowed.includes(origin)) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

/**
 * request.cf 的经纬度是字符串（"22.27832"），本地 dev 下整个 cf 对象还可能不存在。
 * 0 也当成缺失——(0, 0) 在几内亚湾，不会是真访客。
 */
function coordinate(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) && parsed !== 0 ? parsed : undefined
}

async function handleVisit(
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> {
  const cf = ((request as { cf?: Partial<IncomingRequestCfProperties> }).cf ??
    {}) as Partial<IncomingRequestCfProperties>

  await recordVisit(env, {
    ip: request.headers.get('cf-connecting-ip') ?? '0.0.0.0',
    userAgent: request.headers.get('user-agent') ?? '',
    country: cf.country,
    region: cf.region,
    city: cf.city,
    latitude: coordinate(cf.latitude),
    longitude: coordinate(cf.longitude),
    asn: cf.asn,
    asOrganization: cf.asOrganization,
  })

  // 204 无 body：sendBeacon 不看响应，能省一字节是一字节
  return new Response(null, { status: 204, headers: cors })
}

async function handleMap(
  url: URL,
  env: Env,
  ctx: ExecutionContext,
  cors: Record<string, string>,
): Promise<Response> {
  const raw = url.searchParams.get('days')
  const days = raw === null ? 0 : Number(raw)

  if (!ALLOWED_RANGES.has(days)) {
    return Response.json({ error: 'days 只接受 0 / 7 / 30' }, { status: 400, headers: cors })
  }

  // 缓存键只由 days 决定，故意不带 Origin：CORS 头在返回时才拼上去。
  // 否则 Vary: Origin 会让同一份数据按来源存很多份，白白占缓存。
  const cacheKey = new Request(`https://blogsite-api.internal/map?days=${days}`)
  const hit = await caches.default.match(cacheKey)

  if (hit) {
    return new Response(await hit.text(), {
      headers: { 'Content-Type': JSON_TYPE, ...cors, 'X-Cache': 'HIT' },
    })
  }

  const body = JSON.stringify(await readMap(env, days as MapRange))

  ctx.waitUntil(
    caches.default.put(
      cacheKey,
      new Response(body, {
        headers: { 'Content-Type': JSON_TYPE, 'Cache-Control': `max-age=${MAP_CACHE_SECONDS}` },
      }),
    ),
  )

  return new Response(body, {
    headers: {
      'Content-Type': JSON_TYPE,
      'Cache-Control': `public, max-age=${MAP_CACHE_SECONDS}`,
      ...cors,
      'X-Cache': 'MISS',
    },
  })
}
