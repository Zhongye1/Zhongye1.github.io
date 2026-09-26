import type { Env } from './types'

/**
 * 「博客统计」卡片要的两个数字。
 */
export interface StatsPayload {
  updatedAt: string
  totals: {
    // 访客数，独立访客 = 新库的 `COUNT(DISTINCT ip_hash)`
    visitors: number
    // 访问量（浏览量）= `SUM(visits)`
    visits: number
  }
}

/**
 * 全表两条聚合
 */
const QUERY = `
  SELECT
    COUNT(DISTINCT ip_hash)   AS visitors,
    COALESCE(SUM(visits), 0)  AS visits
  FROM visits
`

interface StatsRow {
  visitors: number
  visits: number
}

/**
 * 读全站总数
 */
export async function readStats(env: Env, at: Date = new Date()): Promise<StatsPayload> {
  const row = await env.DB.prepare(QUERY).first<StatsRow>()

  return {
    updatedAt: at.toISOString(),
    totals: {
      visitors: row?.visitors ?? 0,
      visits: row?.visits ?? 0,
    },
  }
}
