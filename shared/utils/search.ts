/**
 * 搜索的纯计算：命中判断、结果合并、片段清洗。
 *
 * 为什么需要"合并"两路结果：`@nuxt/content` 的 FTS 表用的是 fts5 默认分词器
 * （unicode61），中文没有空格，一整段连续汉字会被切成**一个 token**，前缀查询
 * 只对词首有效 —— 实测 "数据可视化" 能命中，而 "可视化" / "四叉树" 命不中。
 * 所以 FTS 之外必须保留子串匹配，中文搜索才不会退化。
 */

export interface SearchablePost {
  path: string
  title?: string | null
  description?: string | null
  tags?: string[] | null
  date?: string | null
}

export interface SearchHit {
  /** 结果标识：文章是 `path`，正文小节是 `path#anchor` */
  id: string
  title: string
  /** FTS 片段，只含 `<mark>` 标签 */
  titleHtml?: string
  /** 祖先标题链，直接当面包屑用 */
  prefix?: string
  description?: string
  descriptionHtml?: string
  level?: number
  rank?: number
  source: 'fts' | 'post'
}

/** 归一化查询词：去首尾空白、压掉连续空白、转小写 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** 子串命中：标题、摘要、标签任一包含即可（中文搜索靠它兜底） */
export function matchPost(post: SearchablePost, query: string): boolean {
  const term = normalizeQuery(query)
  if (!term) return false

  return [post.title, post.description, ...(post.tags ?? [])].some(
    (field) => typeof field === 'string' && field.toLowerCase().includes(term),
  )
}

/** 按日期倒序，缺日期的排到最后 */
export function sortPostsByDate<T extends SearchablePost>(posts: readonly T[]): T[] {
  return [...posts].toSorted((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

/**
 * 合并两路结果：FTS 在前，子串命中在后。
 * 文章级命中若已被正文小节命中（同一路径），就跳过，避免同一篇文章出现两次。
 */
export function mergeSearchHits(
  ftsHits: readonly SearchHit[],
  postHits: readonly SearchHit[],
  limit = 12,
): SearchHit[] {
  const merged: SearchHit[] = []
  const seen = new Set<string>()

  for (const hit of ftsHits) {
    if (merged.length >= limit) return merged
    if (seen.has(hit.id)) continue
    seen.add(hit.id)
    merged.push(hit)
  }

  const matchedPaths = new Set(ftsHits.map((hit) => hit.id.split('#')[0]))

  for (const hit of postHits) {
    if (merged.length >= limit) break
    if (seen.has(hit.id) || matchedPaths.has(hit.id)) continue
    seen.add(hit.id)
    merged.push(hit)
  }

  return merged
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

/**
 * 清洗 FTS 片段：它由"正文纯文本 + `<mark>` 包裹的命中词"拼成，
 * 但正文终归来自 markdown，稳妥起见只放行 `<mark>`，其余一律转义，再交给 `v-html`。
 */
export function sanitizeSnippet(html: string): string {
  return html
    .split(/(<\/?mark>)/i)
    .map((part) => (/^<\/?mark>$/i.test(part) ? part.toLowerCase() : escapeHtml(part)))
    .join('')
}
