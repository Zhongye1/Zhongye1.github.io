// sitemap 的动态数据源（由 nuxt.config 的 `sitemap.sources` 引用）。
//
// 为什么不用 @nuxtjs/sitemap 自带的 Content v3 数据源：它直接拿集合的 `path`
// （`/posts/2026/foo`），而线上路由是 `/blog/2026/foo`，照搬会往 sitemap 里塞 404。
// 这里统一走 toBlogPath 重写，顺带把 lastmod 定为 `updated || published`。
import { queryCollection } from '@nuxt/content/server'
import { postDate, toBlogPath } from '~~/app/utils/content'

export default defineSitemapEventHandler(async (event) => {
  const posts = await queryCollection(event, 'posts')
    .select('path', 'published', 'date', 'updated')
    .all()

  return posts.map((post) =>
    asSitemapUrl({
      // 带尾斜杠：GitHub Pages 的目录型 URL 就是这个形状，省一次 301
      loc: `${toBlogPath(post.path)}/`,
      lastmod: (post.updated || postDate(post) || '').slice(0, 10) || undefined,
      changefreq: 'monthly',
      priority: 0.7,
    }),
  )
})
