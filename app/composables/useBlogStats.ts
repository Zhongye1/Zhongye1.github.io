export interface AnnualStats {
  year: string
  posts: number
  words: number
}

export interface BlogStats {
  posts: number
  words: number
  /** 按年份汇总，用于字数那一格的悬浮提示 */
  annual: AnnualStats[]
}

/**
 * 右侧栏统计卡片的数据。
 */
export async function useBlogStats() {
  const { data } = await useAsyncData('blog-stats', () =>
    queryCollection('posts').select('path', 'words', 'published', 'date').all(),
  )

  const stats = computed<BlogStats>(() => {
    const annual = new Map<string, AnnualStats>()
    let posts = 0
    let words = 0

    for (const post of data.value ?? []) {
      const count = post.words ?? 0
      posts += 1
      words += count

      const year = postDate(post).slice(0, 4) || '未知'
      const bucket = annual.get(year) ?? { year, posts: 0, words: 0 }
      bucket.posts += 1
      bucket.words += count
      annual.set(year, bucket)
    }

    return {
      posts,
      words,
      // 年份倒序，提示里先看到最近一年
      annual: [...annual.values()].toSorted((a, b) => b.year.localeCompare(a.year)),
    }
  })

  return { stats }
}
