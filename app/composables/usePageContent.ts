import type { Collections } from '@nuxt/content'
import type { Ref } from 'vue'

/** 一条正文在 content 库里的位置 */
interface ContentRef {
  collection: keyof Collections
  path: string
}

/**
 * 路由参数可能是百分号编码的：路由来自 URL 时（中文文件名 → `%E7%A5%9E…`）原样保留 URL 的编码，
 * 来自 payload / 程序内跳转时又是解码后的。content 库里存的是解码后的路径，两种形态都得归一，
 * 否则同一篇文章会算出两个 async data key —— 客户端会因此多查一次内容库（要现拉 sqlite）。
 */
function decodeSegment(segment: string): string {
  if (!segment.includes('%')) return segment
  try {
    return decodeURIComponent(segment)
  } catch {
    // 不是合法的转义序列（正文里真的有个 `%`），按原样用
    return segment
  }
}

/**
 * 路由 → 正文位置。
 *
 * 认路由前缀而不是「有没有 slug 参数」：分类页 / 标签页也是 catch-all，同样带 `slug`
 * （`/category/笔记` → `['笔记']`），只看参数会拿 `笔记` 去 posts 集合里查一遍。
 *
 * 路径用路由参数而不是 `route.path` 拼：`route.path` 始终带着 URL 的百分号编码（中文文件名会变成
 * `%E8%AE%B0…`），参数则要看路由来自哪里（见 decodeSegment）。catch-all 的路由参数还会被尾斜杠
 * 多带出一个空段（`/blog/a/` → `['a', '']`），过滤掉才能拼出库里真正存在的 `/posts/a`。
 *
 * 关于页的正文固定在 `spec/about`、页面路由却是 `/about`（内容来源见 content.config.ts 的
 * `pages` 集合），这层「路由 ≠ 内容路径」的映射只能写在这里。
 */
function resolveContent(pathname: string, slugParam: unknown): ContentRef | null {
  const path = pathname.replace(/\/+$/, '')

  if (path === '/about') return { collection: 'pages', path: '/spec/about' }
  if (!path.startsWith('/blog/')) return null

  const slug = (Array.isArray(slugParam) ? slugParam : slugParam == null ? [] : [slugParam])
    .map(String)
    .filter(Boolean)
    .map(decodeSegment)

  return slug.length ? { collection: 'posts', path: `/posts/${slug.join('/')}` } : null
}

/**
 * 当前路由对应的正文。文章页 / 关于页与 layout 右栏的目录共用同一份 `useAsyncData`。
 *
 * 右栏为什么不读页面写下的状态（原来是 `useState('page-toc')` + 页面里 `setPageToc`）：
 * SSR 时 layout 的右栏先于页面的异步 setup 渲染，页面写下的目录对首屏 HTML 来说太晚了 ——
 * 服务端渲染不出目录，客户端 hydration 却能从 payload 里读到并画出来，两者必然对不上
 * （Vue 报 "Hydration completed but contains mismatches"）。改成两侧各自 await 同一个 key：
 * key 相同只会查一次，谁先渲染都拿得到数据，目录也能真正渲进 HTML。
 *
 * `T` 由调用方声明自己期待哪个集合：路由 → 集合的映射是运行时算的，页面自己知道答案
 * （文章页 = posts，关于页 = pages），右栏两种都要接，所以默认是全集。
 */
export async function usePageContent<T extends keyof Collections = keyof Collections>() {
  const route = useRoute()
  const source = computed(() => resolveContent(route.path, route.params.slug))
  // 只盯内容路径这个字符串：hydration 期间路由对象会来回换（同一条 URL 的编码 / 尾斜杠形态），
  // 盯着 computed 返回的对象会因为「每次都是新对象」而白跑一次查询
  const contentPath = computed(() => source.value?.path ?? 'none')

  const { data } = await useAsyncData(
    () => `page-content-${contentPath.value}`,
    () => {
      const ref = source.value
      return ref ? queryCollection(ref.collection).path(ref.path).first() : Promise.resolve(null)
    },
    { watch: [contentPath] },
  )

  return {
    content: data as Ref<Collections[T] | null>,
    /** 命中的内容路径（`/posts/…`），没命中就是空串，供 404 文案用 */
    path: computed(() => source.value?.path ?? ''),
    /** 正文标题树，右栏目录用 */
    toc: computed(() => data.value?.body?.toc?.links ?? []),
  }
}
