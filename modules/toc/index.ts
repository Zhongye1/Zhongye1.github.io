import { defineNuxtModule } from '@nuxt/kit'
import type { FileAfterParseHook, FileBeforeParseHook, MarkdownRoot } from '@nuxt/content'
import { generateToc, type TocOptions } from './generator'

/**
 * 用本地实现接管内容的目录（TOC）生成，产出与 `@nuxtjs/mdc` 一致。
 *
 * 算法在 `./generator.ts`，这里只负责把它接进 `@nuxt/content` 的解析流程：
 * - `content:file:beforeParse`：关掉 @nuxtjs/mdc 自带的 toc 生成，避免同一份数据算两遍；
 * - `content:file:afterParse`：此时正文已经是 minimark 树，按配置与 frontmatter 生成目录，
 *   写回 `body.toc`（和 MDC 一样嵌在 body 里，随 body 一起入库）。
 *
 * 配置沿用 `content.build.markdown.toc`（`{ depth, searchDepth }`，也可以给 `false` 关掉），
 * 这样它仍然参与 @nuxt/content 的构建缓存 hash。
 */

/** 与 `@nuxtjs/mdc` 的 toc 选项同形，额外允许 `false` 关闭目录 */
type TocModuleOption = false | TocOptions

interface ContentModuleOptions {
  build?: {
    markdown?: {
      toc?: TocModuleOption
    }
  }
}

export default defineNuxtModule({
  meta: { name: 'blog-toc' },
  setup(_options, nuxt) {
    const configured = (nuxt.options as { content?: ContentModuleOptions }).content?.build?.markdown
      ?.toc

    nuxt.hook('content:file:beforeParse', (ctx: FileBeforeParseHook) => {
      // `parserOptions` 会在钩子返回后被 @nuxt/content 展开传给 markdown transformer，
      // 所以整体替换 markdown 对象就能让 MDC 拿到 `toc: false`。
      ctx.parserOptions.markdown = { ...ctx.parserOptions.markdown, toc: false }
    })

    nuxt.hook('content:file:afterParse', (ctx: FileAfterParseHook) => {
      const body = ctx.content.body as MarkdownRoot | undefined
      if (!body || body.type !== 'minimark' || !Array.isArray(body.value)) return

      // frontmatter 的 `toc`：作为 schema 字段时在顶层，否则落在 `meta` 里
      const meta = ctx.content.meta as Record<string, unknown> | undefined
      const tocOption = (meta?.toc ?? ctx.content.toc ?? configured) as TocModuleOption | undefined

      if (tocOption === false) {
        delete body.toc
        return
      }

      body.toc = generateToc(body, tocOption ?? {})
    })
  },
})
