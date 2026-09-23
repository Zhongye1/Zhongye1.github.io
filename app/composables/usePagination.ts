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
 *
 * 与 blog-v3 的差别：那边页码存在 query 里（`?page=2`），composable 负责读写 URL；
 * 本站走**路径分页**（`/blog/page/2`），页码由路由参数提供，所以这里只管"切哪一段" ——
 * 静态站这样才能每页一份预渲染 HTML，也就不需要客户端抛弃预渲染结果那一手。
 * 越界处理也相应前移：由页面显式 404，而不是悄悄回落成第 1 页。
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
