export interface TaxonomyTerm {
  name: string
  /** 该分类 / 标签下的文章数 */
  count: number
}

/**
 * 左栏分类与标签列表的数据。
 * 一次查询喂两组列表，key 固定，侧栏与 `/tags` 页面共用同一份 payload。
 */
export async function useBlogTaxonomies() {
  const { data } = await useAsyncData('blog-taxonomies', () =>
    queryCollection('posts').select('category', 'tags').all(),
  )

  const categories = computed(() => countTerms((data.value ?? []).map((post) => post.category)))
  const tags = computed(() => countTerms((data.value ?? []).flatMap((post) => post.tags ?? [])))

  return { categories, tags }
}

/** 按篇数倒序；篇数相同按名称排，避免每次构建出来的顺序不一样 */
function countTerms(names: (string | null | undefined)[]): TaxonomyTerm[] {
  const counter = new Map<string, number>()

  for (const name of names) {
    if (name) counter.set(name, (counter.get(name) ?? 0) + 1)
  }

  return [...counter]
    .map(([name, count]) => ({ name, count }))
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'))
}
