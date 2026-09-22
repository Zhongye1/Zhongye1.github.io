import type { TocLink } from '@nuxt/content'

/** 目录条目：直接复用 @nuxt/content（@nuxtjs/mdc）产出的 `body.toc.links` 形状 */
export type TocEntry = TocLink

interface PageTocState {
  /** 写入 TOC 的页面路径，用来判断当前页是否真的需要展示目录 */
  path: string
  links: TocEntry[]
}

/**
 * 页面与 layout 右侧栏共享的 TOC 状态。
 * 状态里带上写入时的路径：换到没有目录的页面时，侧边栏不会残留上一篇的目录。
 */
export function usePageToc() {
  const route = useRoute()
  const state = useState<PageTocState>('page-toc', () => ({ path: '', links: [] }))

  const toc = computed(() => (state.value.path === route.path ? state.value.links : []))

  function setPageToc(links?: TocEntry[] | null) {
    state.value = { path: route.path, links: links ?? [] }
  }

  return { toc, setPageToc }
}
