import type { Env, MapRange, VisitorKind } from './types'

/**
 * 喂给前端 DottedMap 的 marker。
 *
 * 结构**故意等于** `DottedMapMarker`（见 app/utils/dotted-map/types.ts）：
 * `{ id, latitude, longitude, data }`。前端拿到就能直接 `:markers="markers"`，
 * 不需要在客户端再转换一次——转换逻辑放这里，前端就少一处要跟着改的地方。
 */
export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  data: {
    /** 固定值。当前只有访客一层，留字段是为了以后加图层时不破坏契约 */
    kind: 'visitor'
    /** DottedMap 的 slot 会读它，是地图上能看到的城市名 */
    name: string
    country: string
    visits: number
    uniques: number
    /**
     * 气泡数字与大小的权重。
     *
     * ⚠️ DottedMap 原生气泡显示的是「该网格里的 marker 个数」，不是任何权重字段
     * （engine.ts 里 `displayCount = Math.round(ac.count)`）。
     * 所以 clustering.ts 需要配合改成按 weight 累加，否则 54 次访问只会显示成 1。
     */
    weight: number
    breakdown: Record<VisitorKind, number>
    /** 给点上色用：这个城市以哪类流量为主 */
    dominantKind: VisitorKind
  }
}

export interface MapPayload {
  updatedAt: string
  days: MapRange
  totals: {
    visits: number
    uniques: number
    cities: number
    countries: number
    byKind: Record<VisitorKind, number>
  }
  markers: MapMarker[]
}

/** 单次响应最多给多少个城市。当前实测 56 个，留足余量。 */
const MAX_MARKERS = 500

/**
 * `?1 = 0 OR …` 让「全部」走短路，不必为它单独写一条 SQL。
 *
 * `'+8 hours'` 不能省：不加的话窗口按 UTC 切，和「最近 7 天」的直觉差 8 小时。
 */
const QUERY = `
  SELECT
    country,
    city,
    AVG(latitude)  AS latitude,
    AVG(longitude) AS longitude,
    SUM(visits)    AS visits,
    COUNT(*)       AS uniques,
    SUM(CASE WHEN kind = 'human'   THEN visits ELSE 0 END) AS human_visits,
    SUM(CASE WHEN kind = 'proxy'   THEN visits ELSE 0 END) AS proxy_visits,
    SUM(CASE WHEN kind = 'crawler' THEN visits ELSE 0 END) AS crawler_visits
  FROM visits
  WHERE ?1 = 0 OR day >= date('now', '+8 hours', '-' || ?1 || ' days')
  GROUP BY country, city
  ORDER BY visits DESC
  LIMIT ?2
`

interface CityRow {
  country: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  visits: number
  uniques: number
  human_visits: number
  proxy_visits: number
  crawler_visits: number
}

/**
 * 主色取访问量最大的那一类。代理和爬虫照常显示（决策 2），
 * 只是颜色不同，让人一眼能分辨哪些点不是真人。
 */
function dominantKind(breakdown: Record<VisitorKind, number>): VisitorKind {
  const entries = Object.entries(breakdown) as [VisitorKind, number][]
  return entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0]
}

/**
 * 读出图数据。调用方说「最近几天」，拿到的是可以直接塞进地图的 marker 数组。
 *
 * SQL、聚合、平均坐标、marker 塑形都封在这里，路由层只负责校验 days。
 */
export async function readMap(
  env: Env,
  days: MapRange,
  at: Date = new Date(),
): Promise<MapPayload> {
  const { results } = await env.DB.prepare(QUERY).bind(days, MAX_MARKERS).all<CityRow>()

  const byKind: Record<VisitorKind, number> = { human: 0, proxy: 0, crawler: 0 }
  const markers: MapMarker[] = []
  const countries = new Set<string>()
  let visits = 0
  let uniques = 0

  for (const row of results) {
    // 没有坐标的行画不出来。建表时允许为空是为了不丢数据，
    // 但出图这一步必须挡住，否则地图上会冒出一个 (0, 0) 的点。
    if (row.latitude === null || row.longitude === null || !row.city) continue

    const country = row.country ?? ''
    const breakdown: Record<VisitorKind, number> = {
      human: row.human_visits,
      proxy: row.proxy_visits,
      crawler: row.crawler_visits,
    }

    countries.add(country)
    visits += row.visits
    uniques += row.uniques
    byKind.human += breakdown.human
    byKind.proxy += breakdown.proxy
    byKind.crawler += breakdown.crawler

    markers.push({
      // 用国家+城市而不是自增序号：前端切时间窗后 id 稳定，
      // DottedMap 的 activeMarkerIds 才不会在刷新时错位
      id: `visitor:${country}:${row.city}`,
      latitude: row.latitude,
      longitude: row.longitude,
      data: {
        kind: 'visitor',
        name: row.city,
        country,
        visits: row.visits,
        uniques: row.uniques,
        weight: row.visits,
        breakdown,
        dominantKind: dominantKind(breakdown),
      },
    })
  }

  return {
    updatedAt: at.toISOString(),
    days,
    totals: { visits, uniques, cities: markers.length, countries: countries.size, byKind },
    markers,
  }
}
