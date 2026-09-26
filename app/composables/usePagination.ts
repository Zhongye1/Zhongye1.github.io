import type { MaybeRefOrGetter } from 'vue'
import { clampPage, countPages } from '~~/shared/utils/pagination'

export interface UsePaginationOptions {
  /** 当前页码，通常来自路由参数；不传即第 1 页 */
  page?: MaybeRefOrGetter<number>
  /** 每页条数，默认取 `appConfig.pagination.perPage` */
  perPage?: number
}

/**
 * 把列表切成当前页。
 */
export function usePagination<T>(list: MaybeRefOrGetter<T[]>, options: UsePaginationOptions = {}) {
  const appConfig = useAppConfig()
  const perPage = options.perPage ?? appConfig.pagination?.perPage ?? 10

  const totalPages = computed(() => countPages(toValue(list).length, perPage))
  const page = computed(() => clampPage(Number(toValue(options.page ?? 1)), totalPages.value))

  const listPaged = computed(() => {
    const start = (page.value - 1) * perPage
    return toValue(list).slice(start, start + perPage)
  })

  return { page, totalPages, listPaged }
}
