/**
 * 列表页的文章数据。
 * 第 1 页与 `/blog/page/N` 用同一个 `useAsyncData` key，payload 只取一次就在两处复用。
 */
import { coverList } from '@/site.config'

export async function useBlogPosts() {
  const { data } = await useAsyncData('blog-posts', () =>
    queryCollection('posts')
      // 列必须显式 select，漏掉的字段在前端就是 undefined（cover 之前就是这么丢的）
      .select(
        'path',
        'title',
        'description',
        'date',
        'published',
        'category',
        'tags',
        'cover',
        'words',
      )
      .all(),
  )

  const posts = computed(() =>
    (data.value ?? [])
      // published 优先、缺日期的排最后（与分页前一致）
      .toSorted((a, b) => postTimestamp(b) - postTimestamp(a))
      // 没写 cover 的按路径补一张兜底图；这里补完，视图层就不用关心封面从哪来
      .map((post) => ({ ...post, cover: post.cover || pickCover(post.path, coverList) })),
  )

  return { posts }
}
