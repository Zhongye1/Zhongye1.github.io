import type { MaybeRefOrGetter } from 'vue'
import type { TocLink } from '@nuxt/content'
import { flattenToc } from '~~/shared/utils/toc'

/**
 * 目录高亮用的 scrollspy：观察正文里的标题，视口内可见的写进 `visibleIds`。
 *
 * `activeIds` 在可见集合之上再兜一层：一个都不可见时保留上一次的结果，避免滚到两段
 * 标题之间时高亮闪没（与 @nuxt/ui v4 的 `useScrollspy` 一致）。正文是异步渲染的，
 * 所以除了挂载时观察一次，还要在页面加载结束、过渡结束后重新绑定。
 */
export function useTocScrollspy(links: MaybeRefOrGetter<TocLink[] | undefined>) {
  const visibleIds = ref<string[]>([])
  const activeIds = ref<string[]>([])
  let observer: IntersectionObserver | undefined

  function handleIntersect(entries: IntersectionObserverEntry[]) {
    // 一次回调里批量写入，下游 watcher 只跑一次
    const ids = new Set(visibleIds.value)
    let changed = false

    for (const entry of entries) {
      const id = entry.target.id
      if (!id) continue

      if (entry.isIntersecting) {
        if (!ids.has(id)) {
          ids.add(id)
          changed = true
        }
      } else if (ids.delete(id)) {
        changed = true
      }
    }

    if (changed) visibleIds.value = [...ids]
  }

  /** 按目录里的 id 去正文找锚点；换文章、过渡结束都要重来一次 */
  function refresh() {
    if (!import.meta.client) return

    observer ??= new IntersectionObserver(handleIntersect)
    // 先断开旧目标，避免重复调用时越挂越多
    observer.disconnect()
    visibleIds.value = []

    for (const link of flattenToc(toValue(links) ?? [])) {
      const heading = document.getElementById(link.id)
      if (heading) observer.observe(heading)
    }
  }

  watch(visibleIds, (ids, previous) => {
    activeIds.value = ids.length ? ids : previous
  })

  // 目录换了一份（切文章）要重新观察
  watch(
    () =>
      flattenToc(toValue(links) ?? [])
        .map((link) => link.id)
        .join('\n'),
    () => nextTick(refresh),
  )

  onMounted(() => nextTick(refresh))

  const nuxtApp = useNuxtApp()
  const offLoadingEnd = nuxtApp.hooks.hook('page:loading:end', () => nextTick(refresh))
  const offTransitionFinish = nuxtApp.hooks.hook('page:transition:finish', () => nextTick(refresh))

  onBeforeUnmount(() => {
    observer?.disconnect()
    offLoadingEnd()
    offTransitionFinish()
  })

  return { visibleIds, activeIds, refresh }
}
