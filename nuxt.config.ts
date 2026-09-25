// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'node:path'
import { createJiti } from 'jiti'
import siteConfig, { rssFeed, themeStorageKey } from './app/site.config'

const jiti = createJiti(import.meta.url)

/**
 * 首帧之前把明暗主题定下来的内联脚本，注入 <head>。
 *
 * 页面是静态生成的：SSR 出来的 HTML 里既没有 localStorage 也没有 matchMedia，只能渲染成浅色，
 * 等客户端 hydration 之后 useDark 才补上 .dark。深色用户因此会先看到一帧白，而昼夜开关
 * （ClientOnly）恰好也是那一刻才出现，看起来就像「等按钮加载出来才切换成黑夜」。
 * 这段脚本在 <head> 里同步执行（阻塞解析，早于首帧与首屏绘制），把这一帧补掉。
 *
 * 键取自 site.config，和 useTheme 里 useDark 的 storageKey 是同一个常量 —— 两边对不上又会漏白。
 */
const themeBootstrap = `(() => {
  let mode = 'auto'
  try {
    mode = localStorage.getItem('${themeStorageKey}') || 'auto'
  } catch {}
  const systemDark = matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', mode === 'dark' || (mode === 'auto' && systemDark))
})()`

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
  // @nuxtjs/seo 必须在 @nuxt/content 之前加载：sitemap 的 content 数据源靠模块顺序挂载
  modules: ['@nuxtjs/seo', '@unocss/nuxt', '@vueuse/nuxt', '@nuxt/content'],
  components: [
    { path: '~/components/widget-right' },
    { path: '~/components/widget-left' },
    '~/components',
  ],
  css: [
    '~/assets/css/color.scss',
    '~/assets/css/font.scss',
    '~/assets/css/main.scss',
    // 主题切换的圆形揭示（View Transitions）。伪元素挂在 :root 上，必须是全局样式，
    // 放进组件里会被 scoped 掉；样式始终存在，但只在 html.theme-transitioning 期间生效
    '~/assets/css/theme-reveal.scss',
    '~/assets/css/shiki.scss',
    // 公式样式。必须与 rehype-katex 渲染时用的 katex 同版本，见 package.json 里的版本约束
    'katex/dist/katex.min.css',
    '~/assets/css/content.scss',
  ],
  content: {
    build: {
      // 关闭构建期 Shiki：代码块先产出纯文本，由客户端组件接管高亮，
      // 这样高亮器读到的是未转义源码，也不受构建时主题限制。
      markdown: {
        highlight: false,
        remarkPlugins: {
          // 公式：把 $...$ / $$...$$ 解析成数学节点（单美元行内公式是默认开的）
          'remark-math': {},
          'remark-code-component': localPlugin('remark-code-component', {
            mermaid: { component: 'mermaid', prop: 'code' },
          }),
          'remark-post-stats': localPlugin('remark-post-stats'),
        },
        rehypePlugins: {
          // 再把数学节点编译成 KaTeX 的 HTML + MathML：公式是内容而不是交互，
          // 构建期落进 HTML 后无 JS 也能读、爬虫也认（对应上面引入的 katex.min.css）
          'rehype-katex': {},
          'rehype-meta-slots': localPlugin('rehype-meta-slots'),
        },
        // 目录（TOC）由 modules/toc 生成，@nuxtjs/mdc 自带的生成已被该模块关闭。
        // 这里仍是唯一的配置入口，改动会参与 @nuxt/content 的构建缓存 hash。
        toc: { depth: 4, searchDepth: 4 },
      },
      pathMeta: {
        slugifyOptions: { lower: true, remove: slugifyRemove },
      },
    },
  },
  runtimeConfig: {
    public: {
      buildTime: new Date().toISOString(),
    },
  },
  // Nitro generates `.nuxt/tsconfig.server.json` without a `types` array, so TypeScript
  // implicitly includes every installed `@types/*` package. That trips over the deprecated,
  // types-less `@types/parse-path` stub and fails with TS2688, so pin the types explicitly.
  nitro: {
    // 静态站（GitHub Pages）：server route 不在抓取范围内，必须显式预渲染成真的 rss.xml
    prerender: {
      routes: [rssFeed.path],
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: [],
        },
      },
    },
  },
  sitemap: {
    // Content v3 自带的数据源输出的是集合内部路径 /posts/**，线上实际是 /blog/**，
    // 直接放进去会得到一片 404，所以关掉它、改用下面的数据源重写路径
    excludeAppSources: ['@nuxt/content@v3:urls'],
    sources: ['/api/__sitemap__/urls'],
    // /blog 只是跳回首页的旧路径壳，不该进 sitemap
    exclude: ['/blog'],
  },
  robots: {
    // 站点无私有路径，默认放行；Sitemap 行由 site.url 自动补
    disallow: [],
  },
  // nuxt-og-image 本身不带渲染器，必须自备 satori+resvg / takumi / playwright-core 之一。
  // 一个都没装时它照样注册运行时：dev 下所有路由 500（Cannot find package 'satori'），
  // 本机有 Chrome 时还会先报 playwright-core 解析失败。本站的 og:image 直接取文章封面
  // （见 app/pages/blog/[...slug].vue），没用到生成式 OG 卡片，所以先关掉整个模块。
  // 以后要做标题卡片：装一个渲染器，再把这里换成 { zeroRuntime: true }；若本机/CI 带 Chrome，
  // 还要顺手加 compatibility: { dev: { browser: false }, prerender: { browser: false } }。
  ogImage: {
    enabled: false,
  },
  /** nuxt-site-config 的入口：canonical、og:url、sitemap、robots、schema.org 都读这里 */
  site: {
    url: siteConfig.url,
    name: siteConfig.title,
    description: siteConfig.description,
    defaultLocale: siteConfig.lang,
    // GitHub Pages 上目录型 URL 不带斜杠会先吃一个 301，canonical 必须直接指向落点
    trailingSlash: true,
  },
  app: {
    head: {
      // 全局兜底标题：页面没写 title 时用它（真正的模板在 app/plugins/seo-title.ts，
      // 因为 nuxt-seo-utils 会在运行时用 `%s | %siteName` 覆盖配置里的 titleTemplate）
      title: siteConfig.title,
      // 主题得在首帧之前定下来，否则深色用户会先看到一帧白（原因见文件上方 themeBootstrap）
      script: [{ innerHTML: themeBootstrap }],
      meta: [
        { name: 'author', content: siteConfig.author },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, shrink-to-fit=no' },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      ],
      // 订阅器自动发现：粘站点域名即可认出订阅源
      link: [
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: siteConfig.title,
          href: rssFeed.path,
        },
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
      include: ['../remark-plugins/**/*.ts', '../modules/**/*.ts'],
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
