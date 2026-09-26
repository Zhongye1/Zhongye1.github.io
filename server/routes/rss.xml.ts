// RSS 2.0 订阅源：/rss.xml
//
// 静态站（GitHub Pages）没有运行时，所以这个 server route 必须在 nuxt.config 的
// `nitro.prerender.routes` 里登记，构建期才会落成真的 rss.xml 文件。
//
// 只输出摘要（description）+ 链接，不带全文：Content v3 在服务端拿不到渲染好的
// HTML（body 是 minimark AST），要全文就得自己接 unified 管线或读源文件重渲染。
import { queryCollection } from '@nuxt/content/server'
import { postTimestamp, toBlogPath } from '~~/app/utils/content'
import siteConfig from '~~/app/site.config'

/** 每期条数上限：全量 150 篇会让部分阅读器很吃力，老站虽然全量但这里收一下 */
const MAX_ITEMS = 50

/** XML 1.0 的合法字符集比 JS 字符串小得多，按码点过滤（走正则会被 no-control-regex 拦） */
function stripInvalidXmlChars(value: string): string {
  let result = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    const valid =
      code === 0x9 ||
      code === 0xa ||
      code === 0xd ||
      (code >= 0x20 && code <= 0xd7ff) ||
      (code >= 0xe000 && code <= 0xfffd) ||
      (code >= 0x10000 && code <= 0x10ffff)
    if (valid) result += char
  }
  return result
}

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&apos;',
  '"': '&quot;',
}

function clean(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  return stripInvalidXmlChars(value).replace(/[&<>'"]/g, (char) => XML_ENTITIES[char]!)
}

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'posts')
    .select('path', 'title', 'description', 'published', 'date', 'category', 'tags')
    .all()

  const site = siteConfig.url.replace(/\/+$/, '')
  const feedUrl = `${site}/rss.xml`
  const { buildTime } = useRuntimeConfig(event).public

  const items = posts
    .toSorted((a, b) => postTimestamp(b) - postTimestamp(a))
    .slice(0, MAX_ITEMS)
    .map((post) => {
      // 中文 slug 先百分号编码：XML 里塞原始多字节路径过不了严格的 feed 校验
      const url = encodeURI(`${site}${toBlogPath(post.path)}/`)
      const timestamp = postTimestamp(post)
      // category 与 tags 常重合（frontmatter 里两头都写），去重免得同一分类出现两次
      const categories = [...new Set([post.category, ...(post.tags ?? [])].filter(Boolean))].map(
        (name) => `      <category>${clean(name)}</category>`,
      )

      return [
        '    <item>',
        `      <title>${clean(post.title)}</title>`,
        `      <link>${clean(url)}</link>`,
        `      <guid isPermaLink="true">${clean(url)}</guid>`,
        timestamp ? `      <pubDate>${new Date(timestamp).toUTCString()}</pubDate>` : '',
        `      <description>${clean(post.description || post.title)}</description>`,
        ...categories,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${clean(siteConfig.title)}</title>
    <link>${clean(site)}</link>
    <description>${clean(siteConfig.description)}</description>
    <language>${clean(siteConfig.lang.toLowerCase())}</language>
    <lastBuildDate>${new Date(buildTime ?? Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${clean(feedUrl)}" rel="self" type="application/rss+xml"/>
    <generator>Nuxt Content</generator>
${items}
  </channel>
</rss>
`

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')

  return xml
})
