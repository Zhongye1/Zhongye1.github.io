// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'node:path'
import { createJiti } from 'jiti'
import siteConfig from './app/site.config'

const jiti = createJiti(import.meta.url)

/**
 * remark-plugins/ 是本地 TS 文件，而 @nuxtjs/mdc 是直接 `import()` 插件名的。
 * 当前 Node 版本默认不做类型剥离，import() 会报 Unknown file extension .ts，
 * 所以这里用 jiti 在配置阶段同步加载出插件实例，走 mdc 的 `instance` 字段。
 */
function localPlugin(name: string, options: Record<string, unknown> = {}) {
  return { instance: jiti(resolve(`./remark-plugins/${name}.ts`)).default, options }
}

// slugify 默认规则 + CJK 区间，避免中文文件名被清空导致路径重复
const slugifyRemove = /[^\w\s$*_+~.()'"!\-:@\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+/g

export default defineNuxtConfig({
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@nuxt/content'],
  css: [
    '~/assets/css/color.scss',
    '~/assets/css/font.scss',
    '~/assets/css/main.scss',
    '~/assets/css/shiki.scss',
    '~/assets/css/content.scss',
  ],
  content: {
    build: {
      // 关闭构建期 Shiki：代码块先产出纯文本，由客户端组件接管高亮，
      // 这样高亮器读到的是未转义源码，也不受构建时主题限制。
      markdown: {
        highlight: false,
        remarkPlugins: {
          'remark-code-component': localPlugin('remark-code-component', {
            mermaid: { component: 'mermaid', prop: 'code' },
          }),
        },
        rehypePlugins: {
          'rehype-meta-slots': localPlugin('rehype-meta-slots'),
        },
        toc: { depth: 4, searchDepth: 4 },
      },
      pathMeta: {
        slugifyOptions: { lower: true, remove: slugifyRemove },
      },
    },
  },
  // Nitro generates `.nuxt/tsconfig.server.json` without a `types` array, so TypeScript
  // implicitly includes every installed `@types/*` package. That trips over the deprecated,
  // types-less `@types/parse-path` stub and fails with TS2688, so pin the types explicitly.
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: [],
        },
      },
    },
  },
  app: {
    head: {
      meta: [
        { name: 'description', content: siteConfig.description },
        { name: 'author', content: siteConfig.author },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, shrink-to-fit=no' },
        { name: 'revisit-after', content: '7 days' },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { charset: 'UTF-8' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      ],
      noscript: [{ textContent: 'JavaScript is required' }],
      htmlAttrs: {
        lang: siteConfig.lang,
      },
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  // remark-plugins/ 不在 node tsconfig 默认 include 范围内，需显式加入才能参与类型检查
  typescript: {
    nodeTsConfig: {
      include: ['../remark-plugins/**/*.ts'],
    },
  },
  // 高亮相关的依赖都是按需 import 的，预打包可以避免 dev 下首次高亮时卡顿
  vite: {
    optimizeDeps: {
      include: [
        '@shikijs/colorized-brackets',
        '@shikijs/transformers',
        'shiki/core',
        'shiki/engine/javascript',
        'shiki/langs',
        'shiki/themes/catppuccin-latte.mjs',
        'shiki/themes/one-dark-pro.mjs',
      ],
    },
  },
  compatibilityDate: '2026-09-22',
})
