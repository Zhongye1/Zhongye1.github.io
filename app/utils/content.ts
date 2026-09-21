export interface DatedContent {
  date?: string | null
  published?: string | null
}

/** Hexo frontmatter uses either `published` or `date`, this picks whichever exists. */
export function postDate(post: DatedContent): string {
  return post.published || post.date || ''
}

export function postTimestamp(post: DatedContent): number {
  const value = postDate(post).replace(' ', 'T')
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function formatPostDate(post: DatedContent): string {
  return postDate(post).slice(0, 10)
}
