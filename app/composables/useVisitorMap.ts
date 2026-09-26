import { visitorApi } from '@/site.config'
import type { DottedMapMarker } from '~/utils/dotted-map/types'

/**
 * 访客地图的数据源。
 *
 * 这个模块是**后端响应与地图引擎之间唯一的适配层**：它把服务端的字段名、
 * 时间窗、错误处理都收在这里，`FriendsMap.vue` 只管拿 `markers` 去画。
 * 换后端或者后端改字段时，只需要动这一个文件。
 */

/** 访客类别。三类都上图，只靠颜色区分。 */
export type VisitorKind = 'human' | 'proxy' | 'crawler'

export type VisitorRange = (typeof visitorApi.ranges)[number]['value']

/** `/api/map` 返回的单个 marker。结构已经贴近 `DottedMapMarker`，weight 埋在 data 里。 */
interface ApiMarker {
  id: string
  latitude: number
  longitude: number
  data: {
    name: string
    country: string
    visits: number
    uniques: number
    weight: number
    dominantKind: VisitorKind
    breakdown: Record<VisitorKind, number>
  }
}

export interface VisitorTotals {
  visits: number
  uniques: number
  cities: number
  countries: number
  byKind: Record<VisitorKind, number>
}

interface MapResponse {
  updatedAt: string
  days: number
  totals: VisitorTotals
  markers: ApiMarker[]
}

export function useVisitorMap() {
  // 默认「全部」：站点体量小，7 天窗口经常只有零星几个点，首屏看不出东西
  const days = ref<VisitorRange>(0)
  const payload = ref<MapResponse | null>(null)
  const pending = ref(false)
  const failed = ref(false)

  async function refresh() {
    pending.value = true
    failed.value = false

    try {
      payload.value = await $fetch<MapResponse>('/api/map', {
        baseURL: visitorApi.base,
        query: { days: days.value },
      })
    } catch {
      // 后端挂了不该把整页拖下水：地图退化成空的，其余内容照常渲染。
      // 这里刻意不 throw，也不打 console.error —— 用户看到的就是「暂时没数据」。
      payload.value = null
      failed.value = true
    } finally {
      pending.value = false
    }
  }

  /**
   * 把后端的 `data.weight` 抬成一等的 `marker.weight`。
   *
   * 引擎读的是 `marker.weight`（气泡数字与大小都按它走），而后端把 weight
   * 放在自由的 `data` 袋子里。让两边各自保持干净，转换只发生在这里。
   */
  const markers = computed<DottedMapMarker[]>(() =>
    (payload.value?.markers ?? []).map((marker) => ({
      id: marker.id,
      latitude: marker.latitude,
      longitude: marker.longitude,
      weight: marker.data.weight,
      data: marker.data,
    })),
  )

  const totals = computed<VisitorTotals | null>(() => payload.value?.totals ?? null)

  watch(days, refresh)

  // 静态站是 prerender 出来的，构建期发这个请求没有意义（会被固化进 HTML），
  // onMounted 天然只在客户端跑，正好。
  onMounted(refresh)

  return { days, markers, totals, pending, failed, refresh }
}
