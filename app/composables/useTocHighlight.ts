import type { CSSProperties, MaybeRefOrGetter, Ref } from 'vue'
import type { TocLink } from '@nuxt/content'
import {
  TOC_LINE_HEIGHT,
  TOC_TEXT_HEIGHT,
  buildTocCircuitMask,
  findTocActiveIndex,
  flattenToc,
  flattenTocWithLevel,
  tocIndicatorGeometry,
} from '~~/shared/utils/toc'

export interface UseTocHighlightOptions {
  /** 目录树 */
  links: MaybeRefOrGetter<TocLink[] | undefined>
  /** 当前高亮的标题 id，通常来自 `useTocScrollspy` */
  activeIds: Ref<string[]>
  /** 列表容器：挂载后从里面量真实高度；不传就一直用下面两个兜底值 */
  containerRef?: Ref<HTMLElement | null | undefined>
  /** 兜底行距（rem）：相邻两条链接的间距 */
  rowHeight?: number
  /** 兜底文字行盒高度（rem） */
  textHeight?: number
  /** 指示线高度对齐整行还是文字行盒，默认 'text' */
  size?: MaybeRefOrGetter<'row' | 'text'>
  /** 'span'（默认，与上游一致）指示线覆盖视口内全部可见标题，'active' 只覆盖第一个 */
  mode?: MaybeRefOrGetter<'active' | 'span'>
  /** 'circuit' 时额外产出树状 mask 样式 */
  variant?: MaybeRefOrGetter<'straight' | 'circuit'>
}

/**
 * 把「当前高亮的标题」换算成指示线需要的几何：当前项下标、位移、高度、mask。
 *
 * 高度要分两个：`rowHeight`（行距）决定第 i 项在哪、也是电路 mask 的行高；`textHeight`
 * （文字行盒）决定高亮块多高。整行 = 文字行盒 + 上下 padding，若拿整行当高度，高亮就会
 * 比文字区域上下各多出半个 padding —— 也就是「电路板上的高亮和文字不齐」。
 *
 * 挂载后会量真实 DOM 覆盖这两个兜底值；实测发生在 onMounted 之后，首帧仍与 SSR 一致，
 * 因此不会造成 hydration 不匹配。
 */
export function useTocHighlight(options: UseTocHighlightOptions) {
  const rowHeight = ref(options.rowHeight ?? TOC_LINE_HEIGHT)
  const textHeight = ref(options.textHeight ?? TOC_TEXT_HEIGHT)
  const flatLinks = computed(() => flattenToc(toValue(options.links) ?? []))
  const activeIndex = computed(() => findTocActiveIndex(flatLinks.value, options.activeIds.value))

  /**
   * 指示线覆盖的行数。
   *
   * 默认与文字侧保持一致：文字把视口内可见的标题全部染色，指示线就覆盖同样多的行。
   * 标题在正文里是纵向单调排列的，可见标题在目录里必然是一段连续区间，所以一个矩形
   * 滑块就能精确盖住它们，不需要按区间再生成第二层 mask。
   */
  const rowCount = computed(() => {
    if (toValue(options.mode) === 'active') return 1
    // 切页面时可能残留上一篇的 id，兜一下别让滑块越过列表末尾
    return Math.min(options.activeIds.value.length, flatLinks.value.length - activeIndex.value)
  })

  /** 位移与高度变量，配合 `h-[var(--toc-indicator-size)]` 这类工具类使用 */
  const activeStyle = computed<CSSProperties | undefined>(() => {
    const geometry = tocIndicatorGeometry({
      activeIndex: activeIndex.value,
      count: rowCount.value,
      rowHeight: rowHeight.value,
      textHeight: textHeight.value,
      size: toValue(options.size) ?? 'text',
    })
    if (!geometry) return undefined

    return {
      '--toc-indicator-size': geometry.size,
      '--toc-indicator-position': geometry.position,
    }
  })

  /** circuit 形态的树状 mask，只在开了该形态时产出 */
  const maskStyle = computed<CSSProperties | undefined>(() => {
    if (toValue(options.variant) !== 'circuit') return undefined

    const mask = buildTocCircuitMask(
      flattenTocWithLevel(toValue(options.links) ?? []),
      rowHeight.value,
    )
    // 展开成字面量：CSSProperties 带 `--${string}` 索引签名，接口类型不满足
    return mask ? { ...mask } : undefined
  })

  /**
   * 指示线容器的样式：位移变量 +（circuit 时）树状 mask。
   *
   * 两者必须落在同一个元素上 —— 高亮滑块是被这层 mask 裁剪的子元素，位移变量也只能
   * 从容器继承。分开挂（`:style="isCircuit ? mask : active"`）会得到一个有树无高亮的空壳。
   */
  const indicatorStyle = computed<CSSProperties | undefined>(() => {
    const style: CSSProperties = { ...activeStyle.value, ...maskStyle.value }
    return Object.keys(style).length > 0 ? style : undefined
  })

  function measure() {
    if (!import.meta.client) return

    const container = options.containerRef?.value
    const link = container?.querySelector<HTMLElement>('[data-toc-link]')
    if (!link) return

    const rootFontSize =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16

    const linkHeight = link.getBoundingClientRect().height
    if (linkHeight > 0) rowHeight.value = linkHeight / rootFontSize

    // 文字行盒高度：链接里带 data-toc-text 的那个元素，量不到就沿用兜底值
    const textBoxHeight = link
      .querySelector<HTMLElement>('[data-toc-text]')
      ?.getBoundingClientRect().height
    if (textBoxHeight && textBoxHeight > 0) textHeight.value = textBoxHeight / rootFontSize
  }

  if (options.containerRef) {
    // 容器可能是 v-if 出来的，等它落地再量；尺寸变化（换字号、换文章）也跟着更新
    watch(
      options.containerRef,
      (element, _previous, onCleanup) => {
        if (!element) return

        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(element)
        onCleanup(() => observer.disconnect())
      },
      { flush: 'post' },
    )
  }

  watch(flatLinks, () => nextTick(measure))

  return { activeIndex, rowHeight, textHeight, indicatorStyle }
}
