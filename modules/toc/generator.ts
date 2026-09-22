/**
 * 目录（TOC）生成器。
 *
 * 移植自 `@nuxtjs/mdc` 的 `dist/runtime/parser/toc.js` 与 `dist/runtime/utils/ast.js`，
 * 算法、配置语义、产出结构都与上游一致，换来的只是「自己实现」：
 * 同一份 depth/searchDepth 语义、同一套成树规则、同样的 `{ title, depth, searchDepth, links }`。
 *
 * 和上游唯一的差别是输入形态。`@nuxt/content` 入库前会把正文压缩成 minimark：
 * `{ type: 'minimark', value: [ [tag, props, ...children], ... ] }`，
 * 上游处理的是压缩前的 hast 树，所以这里把遍历和取文本改写成 minimark 版本。
 * 标题 id 直接复用节点上的 `props.id`（MDC 的 github-slugger 已经写好），
 * 不重新生成 slug，保证目录锚点和正文标题 id 完全一致。
 */
import type { MinimarkElement, MinimarkNode, MinimarkTree } from 'minimark'
import type { Toc, TocLink } from '@nuxt/content'

/** 目录配置，与 `@nuxtjs/mdc` 的 toc 选项同形，额外支持 title */
export interface TocOptions {
  /** 目录里包含的最大标题等级，从 h2 起算（1 => h2，2 => h3 …） */
  depth?: number
  /** 搜索标题时向正文内部遍历的最大层级 */
  searchDepth?: number
  /** 目录标题，产出数据里的 `title` 字段 */
  title?: string
}

/** 与 `@nuxtjs/mdc` 的 `defaults.toc` 保持一致 */
export const TOC_DEFAULTS: Required<TocOptions> = { title: '', depth: 2, searchDepth: 2 }

/** 与 `@nuxtjs/mdc` 一致：h1 不进目录，正文首个 h1 会被抽成文章标题 */
const TOC_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6']

const TOC_TAGS_DEPTH: Record<string, number> = { h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }

function isElement(node: MinimarkNode | MinimarkTree): node is MinimarkElement {
  return Array.isArray(node)
}

/** minimark 节点的子节点：元素是 `[tag, props, ...children]`，根节点挂在 `value` 上 */
function childrenOf(node: MinimarkNode | MinimarkTree): MinimarkNode[] | undefined {
  if (Array.isArray(node)) return node.slice(2)
  if (typeof node === 'string') return undefined
  return node.value
}

function getTocTags(depth: number): string[] {
  if (depth < 1 || depth > TOC_TAGS.length) {
    console.warn(
      `[blog-toc] \`toc.depth\` 只支持 1 - ${TOC_TAGS.length}，收到 ${depth}，已回退为 1。`,
    )
    depth = 1
  }
  return TOC_TAGS.slice(0, depth)
}

/** 对应上游的 `flattenNode`：按 searchDepth 深度优先展开，文本节点也会被带回 */
function flattenNode(
  node: MinimarkNode | MinimarkTree,
  maxDepth = 2,
  depth = 0,
): (MinimarkNode | MinimarkTree)[] {
  const children = childrenOf(node)
  if (!children || depth === maxDepth) return [node]
  return [node, ...children.flatMap((child) => flattenNode(child, maxDepth, depth + 1))]
}

/** 对应上游的 `flattenNodeText`：把节点下的文本拍平 */
function flattenNodeText(node: MinimarkNode | MinimarkTree): string {
  if (typeof node === 'string') return node
  const children = childrenOf(node)
  if (!children) return ''
  return children.reduce((text, child) => text + flattenNodeText(child), '')
}

/** 对应上游的 `nestHeaders`：按标题等级把平铺的目录折成树 */
function nestHeaders(headers: TocLink[]): TocLink[] {
  if (headers.length <= 1) return headers

  const toc: TocLink[] = []
  let parent: TocLink | undefined

  headers.forEach((header) => {
    if (!parent || header.depth <= parent.depth) {
      header.children = []
      parent = header
      toc.push(header)
    } else {
      parent.children!.push(header)
    }
  })

  toc.forEach((header) => {
    if (header.children?.length) {
      header.children = nestHeaders(header.children)
    } else {
      delete header.children
    }
  })

  return toc
}

function generateFlatToc(body: MinimarkTree, options: Required<TocOptions>): Toc {
  const tags = getTocTags(options.depth)
  const headers = flattenNode(body, options.searchDepth).filter(
    (node): node is MinimarkElement => isElement(node) && tags.includes(node[0]),
  )

  return {
    title: options.title,
    searchDepth: options.searchDepth,
    depth: options.depth,
    links: headers.map((header) => ({
      id: header[1]?.id as string,
      depth: TOC_TAGS_DEPTH[header[0]]!,
      text: flattenNodeText(header),
    })),
  }
}

export function generateToc(body: MinimarkTree, options: TocOptions = {}): Toc {
  const resolved: Required<TocOptions> = {
    title: options.title ?? TOC_DEFAULTS.title,
    depth: options.depth ?? TOC_DEFAULTS.depth,
    searchDepth: options.searchDepth ?? TOC_DEFAULTS.searchDepth,
  }

  const toc = generateFlatToc(body, resolved)
  toc.links = nestHeaders(toc.links)

  return toc
}
