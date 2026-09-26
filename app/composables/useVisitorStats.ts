import { visitorApi } from '@/site.config'

/**
 * 「博客统计」卡片里的访客数与访问量。
 */

interface StatsResponse {
  updatedAt: string
  totals: {
    /** 访客数（独立访客） */
    visitors: number
    /** 访问量（浏览量） */
    visits: number
  }
}

export function useVisitorStats() {
  const visitors = ref<number | null>(null)
  const visits = ref<number | null>(null)

  async function refresh() {
    try {
      const payload = await $fetch<StatsResponse>('/api/stats', { baseURL: visitorApi.base })
      visitors.value = payload.totals.visitors
      visits.value = payload.totals.visits
    } catch {
      visitors.value = null
      visits.value = null
    }
  }

  onMounted(refresh)

  return { visitors, visits }
}
