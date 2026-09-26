import type { Root, RootContent } from 'mdast'
import { visit } from 'unist-util-visit'

/** 正文里的图片组标记，来自旧站（`content/spec/about.md` 里成组出现的照片） */
const OPEN = '[grid]'
const CLOSE = '[/grid]'

/** remark-mdc 的 inline span 节点（`[文字]` 会被它解析成 `<span>`） */
interface TextComponentNode {
  type: 'textComponent'
  name: string
  children?: { type: string; value?: string }[]
}

/**
 * 把 `[grid]` … `[/grid]` 之间的内容包成图片网格。
 *
 * 标记和图片之间没有空行，而图片是**行内**节点，于是它们被解析进同一个 paragraph ——
 * 边界只能按首尾子节点的文本切，不能按块级节点找。切出来的图片提成容器的直接子节点：
 * 留在 `<p>` 里的话网格只有一个子项，铺不开。
 *
 * 列数写进 `--grid-cols`（= 组内图片数，旧站就是 `md:grid-cols-N`），样式见
 * content.scss 的 `.image-grid`；窄屏退回单列也放在那儿。
 *
 * 注意自定义 remark 插件跑在 remark-mdc **之后**，此时 `[grid]` 已经被它吃成
 * `<span>grid</span>`（`textComponent`），所以两种形态都得认。
 */
export default function remarkGrid() {
  return (tree: Root) => {
    tree.children = tree.children.flatMap((node) => unwrap(node))
  }
}

function unwrap(node: RootContent): RootContent[] {
  if (node.type !== 'paragraph') return [node]

  const children = node.children
  // 标记必须一个在头一个在尾，中间才是组内内容
  if (children.length < 2) return [node]

  const head = markerText(children[0])
  const tail = markerText(children.at(-1))
  if (head === null || tail === null) return [node]

  const openAt = head.indexOf(OPEN)
  const closeAt = tail.indexOf(CLOSE)
  if (openAt < 0 || closeAt < 0) return [node]

  // 标记同一行上还写了别的字：留在组外，别吞掉
  const before = head.slice(0, openAt).trim()
  const after = tail.slice(closeAt + CLOSE.length).trim()

  // 组内内容：掐掉首尾两个标记，行内残余的字（`[grid] 说明` 那种）按原文留在组里
  const inner: RootContent[] = children.slice(1, -1)
  const lead = head.slice(openAt + OPEN.length).trim()
  const trail = tail.slice(0, closeAt).trim()
  if (lead) inner.unshift({ type: 'text', value: lead })
  if (trail) inner.push({ type: 'text', value: trail })

  const grid: RootContent[] = [
    { type: 'html', value: `<div class="image-grid" style="--grid-cols:${countImages(inner)}">` },
    ...inner,
    { type: 'html', value: '</div>' },
  ]

  if (before) grid.unshift({ type: 'paragraph', children: [{ type: 'text', value: before }] })
  if (after) grid.push({ type: 'paragraph', children: [{ type: 'text', value: after }] })

  return grid
}

/**
 * 取节点承载的文本。`textComponent` 那条会把 `[grid]` 还原成 markdown 写法，
 * 后面的判断就只面对一种形态了。
 */
function markerText(node: RootContent | undefined): string | null {
  if (node?.type === 'text') return node.value

  const span = node as TextComponentNode | undefined
  if (span?.type === 'textComponent' && span.name === 'span') {
    return `[${span.children?.map((child) => child.value ?? '').join('') ?? ''}]`
  }

  return null
}

/** 列数就是组里的图片数，没图片时退回 1 列免得 `repeat(0, …)` 把容器摊平 */
function countImages(nodes: RootContent[]) {
  let count = 0
  visit({ type: 'root', children: nodes }, 'image', () => {
    count += 1
  })
  return Math.max(count, 1)
}
