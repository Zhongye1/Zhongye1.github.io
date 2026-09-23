/**
 * 列表页的文章数据。
 * 第 1 页与 `/blog/page/N` 用同一个 `useAsyncData` key，payload 只取一次就在两处复用。
 */
export async function useBlogPosts() {
  const { data } = await useAsyncData('blog-posts', () =>
    queryCollection('posts')
      .select('path', 'title', 'description', 'date', 'published', 'category', 'tags')
      .all(),
  )

  // published 优先、缺日期的排最后（与分页前一致）
  const posts = computed(() =>
    (data.value ?? []).toSorted((a, b) => postTimestamp(b) - postTimestamp(a)),
  )

  return { posts }
}
