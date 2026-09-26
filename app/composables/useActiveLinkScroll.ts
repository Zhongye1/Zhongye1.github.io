import type { Ref } from 'vue'

export interface UseActiveLinkScrollOptions {
  /** 包住链接的容器，用来按顺序取 `[data-toc-link]` */
  containerRef: Ref<HTMLElement | null | undefined>
  /** 当前项下标，-1 表示没有 */
  activeIndex: Ref<number>
  /** 链接选择器，其 DOM 顺序需与目录展开顺序一致 */
  selector?: string
  behavior?: ScrollBehavior
}

/** 向上找最近的、真的能纵向滚动的祖先 */
function findScrollableAncestor(element: HTMLElement | undefined): HTMLElement | undefined {
  let node = element?.parentElement ?? null

  while (node && node !== document.body && node !== document.documentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }

  return undefined
}

/**
 * 当前项变化时把它滚到可视区域中间。
 *
 * 移植自 @nuxt/ui v4 `ContentToc` 里的 watcher：直接改容器的 scrollTop，而不是
 * `scrollIntoView` —— 后者会连同页面一起滚，边界情况下正文会跟着跳一下。
 * 滚动容器是运行时向上找出来的，使用方不必显式传入。
 */
export function useActiveLinkScroll(options: UseActiveLinkScrollOptions) {
  const selector = options.selector ?? '[data-toc-link]'

  watch(options.activeIndex, (index) => {
    if (!import.meta.client || index < 0) return

    // 等属性 / class 落到 DOM 上再量位置
    nextTick(() => {
      const link = options.containerRef.value?.querySelectorAll<HTMLElement>(selector)[index]
      const container = findScrollableAncestor(link)
      if (!link || !container) return

      const containerRect = container.getBoundingClientRect()
      const linkRect = link.getBoundingClientRect()
      const offset = linkRect.top - containerRect.top + container.scrollTop

      container.scrollTo({
        top: offset - container.clientHeight / 2 + linkRect.height / 2,
        behavior: options.behavior ?? 'smooth',
      })
    })
  })
}
