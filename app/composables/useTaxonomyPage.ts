export type TaxonomyKind = 'tag' | 'category'

const KINDS = {
  tag: { label: '标签', base: '/tag' },
  category: { label: '分类', base: '/category' },
} as const

/**
 * 分类 / 标签列表页的数据与校验。
 *
 * 路由是 catch-all：`/tag/Python` 和 `/tag/Python/page/2` 共用一个文件，slug 在这里拆成
 * 「名字 + 可选页码」。换成 `[name]/page/[page]` 的多级目录会变成嵌套路由，父级还得再套一层
 * `<NuxtPage>`，不如把拆分集中在这一处。
 *
 * 取到的都是 computed：Nuxt 在同一个 catch-all 路由内跳转时参数变化不一定重建组件，
 * 保持响应式才能让列表和标题跟着走。
 */
export async function useTaxonomyPage(kind: TaxonomyKind) {
  const route = useRoute()
  const { label, base } = KINDS[kind]

  const segments = computed(() =>
    (Array.isArray(route.params.slug) ? route.params.slug : [route.params.slug]).map(String),
  )
  const name = computed(() => segments.value[0] ?? '')
  const isPaged = computed(() => segments.value.length === 3 && segments.value[1] === 'page')
  const requested = computed(() => (isPaged.value ? Number(segments.value[2]) : 1))

  // 只认 `/<名字>` 和 `/<名字>/page/N`，多一段少一段都当 404
  if (segments.value.length !== 1 && !isPaged.value) {
    throw notFound()
  }

  const { posts } = await useBlogPosts()
  const matched = computed(() =>
    posts.value.filter((post) =>
      kind === 'tag' ? post.tags?.includes(name.value) : post.category === name.value,
    ),
  )

  if (!matched.value.length) {
    throw notFound()
  }

  const path = computed(() => `${base}/${encodeURIComponent(name.value)}`)

  // `/tag/x/page/1` 与 `/tag/x` 是同一页，避免重复内容
  if (isPaged.value && requested.value === 1) {
    await navigateTo(path.value, { replace: true })
  }

  const { page, totalPages } = usePagination(matched, { page: requested })

  if (!Number.isInteger(requested.value) || requested.value > totalPages.value) {
    throw notFound()
  }

  return {
    posts: matched,
    page,
    path,
    title: computed(() =>
      page.value > 1 ? `${label}：${name.value} · 第 ${page.value} 页` : `${label}：${name.value}`,
    ),
    description: computed(
      () => `${label}「${name.value}」下的全部文章，共 ${matched.value.length} 篇。`,
    ),
  }
}

/** 名字不存在、页码越界、路径形状不对，都是同一个 404 */
function notFound() {
  return createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
