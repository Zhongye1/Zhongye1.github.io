/**
 * 目录（TOC）的纯计算：展开、定位当前项、生成 circuit 指示线的 mask。
 *
 * 逻辑移植自 @nuxt/ui v4 的 `ContentToc.vue` 与 `useScrollspy`，只保留与框架、
 * 样式无关的部分，方便复用和单独验证。
 */

/** 递归的目录节点约束，`@nuxt/content` 的 `TocLink` 天然满足 */
export interface TocNode<T> {
  id: string
  children?: T[]
}

/** 行距（rem）：相邻两条链接的间距 = text-sm 行高 1.25 + 上下 py-1 合计 0.5 */
export const TOC_LINE_HEIGHT = 1.75

/** 文字行盒高度（rem），即 text-sm 的 line-height —— 指示线高度对齐的是它，不是整行 */
export const TOC_TEXT_HEIGHT = 1.25

/** 子级缩进（rem），与样式里的 `ms-3` 对应 */
export const TOC_INDENT = 0.75

/** 1rem 折合的 SVG 单位数：坐标都落在整点上，mask 缩放时不会糊 */
const SVG_UNIT_PER_REM = 16

/** 拼 rem 字符串，顺手抹掉浮点尾数（1.75 * 4 会得到 7.000000000000001） */
export function tocRem(value: number): string {
  return `${Number(value.toFixed(4))}rem`
}

/**
 * 深度优先展开成一条平铺列表。
 * 顺序与 `TocTree` 的渲染顺序（先链接、再子级）一致，指示线下标依赖这个前提。
 */
export function flattenToc<T extends TocNode<T>>(links: readonly T[] = []): T[] {
  return links.flatMap((link) => [link, ...flattenToc(link.children ?? [])])
}

/** 展开并带上层级，用于按层级取缩进 */
export function flattenTocWithLevel<T extends TocNode<T>>(
  links: readonly T[] = [],
  level = 0,
): { link: T; level: number }[] {
  return links.flatMap((link) => [
    { link, level },
    ...flattenTocWithLevel(link.children ?? [], level + 1),
  ])
}

/**
 * 当前项下标：取目录顺序里最靠前的可见标题。
 * 可见集合只是增删条目时结果不变，指示线与自动居中也就不会来回抖；没有可见标题时返回 -1。
 */
export function findTocActiveIndex(
  links: readonly { id: string }[],
  activeIds: readonly string[],
): number {
  if (!activeIds.length) return -1
  const ids = new Set(activeIds)
  return links.findIndex((link) => ids.has(link.id))
}

export interface TocIndicatorGeometry {
  /** 高亮块高度（rem 字符串），可直接给 `--toc-indicator-size` */
  size: string
  /** 高亮块位移（rem 字符串），可直接给 `--toc-indicator-position` */
  position: string
}

export interface TocIndicatorGeometryOptions {
  /** 当前项下标，-1 表示没有 */
  activeIndex: number
  /** 覆盖的行数：`span` 模式下是可见标题数 */
  count?: number
  /** 行距（rem），相邻两条链接的间距 —— 决定位移步长，也是 mask 的行高 */
  rowHeight: number
  /** 文字行盒高度（rem） */
  textHeight: number
  /** 高度取整行还是文字行盒，默认 'text' */
  size?: 'row' | 'text'
}

/**
 * 指示线高亮块的尺寸与位移。
 *
 * 关键在于区分两个高度：**行距**决定第 i 项在哪（`i * rowHeight`），**文字行盒**决定
 * 高亮块多高。整行 = 文字行盒 + 上下 padding，若直接拿整行当高度，高亮会比文字区域
 * 上下各多出半个 padding，看起来就是「电路板上的高亮和文字不齐」。所以这里把高亮块
 * 按文字行盒居中放进行里。
 */
export function tocIndicatorGeometry(
  options: TocIndicatorGeometryOptions,
): TocIndicatorGeometry | undefined {
  const { activeIndex, count = 1, rowHeight, textHeight, size = 'text' } = options
  if (activeIndex < 0 || count <= 0) return undefined

  const height = size === 'row' ? rowHeight : Math.min(textHeight, rowHeight)
  const inset = Math.max((rowHeight - height) / 2, 0)

  return {
    size: tocRem(count * rowHeight - inset * 2),
    position: tocRem(activeIndex * rowHeight + inset),
  }
}

export interface TocCircuitMask {
  width: string
  height: string
  maskImage: string
}

/**
 * 把指示线画成「电路板」：顶层一条竖线，子级向右缩进，层级切换处用一小段斜线过渡。
 * 产出的 SVG 作为 mask-image 铺在实心色块上，色块就被裁成树状分支。
 *
 * @param items `flattenTocWithLevel` 的结果，顺序即自上而下的渲染顺序
 * @param lineHeight 单行高度（rem）
 */
export function buildTocCircuitMask(
  items: readonly { level: number }[],
  lineHeight: number = TOC_LINE_HEIGHT,
): TocCircuitMask | undefined {
  if (!items.length) return undefined

  const rowHeight = lineHeight * SVG_UNIT_PER_REM
  const height = items.length * rowHeight
  const width = TOC_INDENT * SVG_UNIT_PER_REM
  // 顶层与子级两条竖线的 x 坐标，间距比缩进少 1.5 个单位，斜线段才不会顶到文字
  const x0 = 0.5
  const x1 = width - 1.5

  let path = ''
  let currentX = x0
  let y = 0

  items.forEach((item, index) => {
    const targetX = item.level > 0 ? x1 : x0
    const nextY = y + rowHeight
    const next = items[index + 1]

    if (index === 0) {
      path += `M${targetX} ${y}`
      currentX = targetX
    }

    // 层级变了：先斜着走到新的 x，再继续竖直向下
    if (targetX !== currentX) {
      path += ` L${targetX} ${y + 6}`
      currentX = targetX
    }

    // 下一项层级也要变时，提前 6 个单位收斜角
    path += ` L${currentX} ${nextY - (next && next.level !== item.level ? 6 : 0)}`
    y = nextY
  })

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'><path d='${path}' stroke='black' stroke-width='1' fill='none'/></svg>`

  return {
    width: tocRem(TOC_INDENT),
    height: tocRem(items.length * lineHeight),
    maskImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
  }
}
