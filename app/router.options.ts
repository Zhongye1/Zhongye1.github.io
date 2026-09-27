import type { RouterConfig } from '@nuxt/schema'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 给所有页面一个「忽略尾部斜杠」的路由 key。
 *
 * 本站是预渲染的静态站，`/blog/a` 与 `/blog/a/` 落的是同一个 index.html：站内链接写的是不带
 * 斜杠的形式（`toBlogPath`），而 GitHub Pages / Cloudflare Pages 会把目录型 URL 301 到带斜杠的
 * 形式。于是「预渲染时记录的路径」（`payload.path`，不带斜杠）与「浏览器里的路径」（带斜杠）
 * 天然不一致，Nuxt 在 hydration 期间会把路由恢复成后者 —— 这本身是设计好的行为。
 *
 * 问题出在页面 key：它由 `path` + `params` 拼出来（见 `generateRouteKey`），而 catch-all 路由
 * （`[...slug].vue`）遇到尾斜杠会多出一个空参数段（`/blog/a/` → `['a', '']`）—— 同一篇文章的
 * 两次路由因此被判成「换了一页」：`<NuxtPage>` 重挂载页面并跑 `pageTransition`（out-in）。
 * 重挂载出来的新实例要么因为 async data 的 key 变了而查不到内容，要么干脆没能进入 DOM，
 * 于是 `<main>` 永远停在 `<!---->` 上：文章闪一下就不见了。
 *
 * 尾部斜杠去掉之后，同一页的两种写法算同一页（不再重挂载），真正的换页（不同文章、不同页码）
 * 仍然会因为 key 不同而重挂载。页面自己用 `definePageMeta({ key })` 写过的 key 保持优先。
 */
const normalizeKey = (route: { path: string }) => route.path.replace(/\/+$/, '')

function withNormalizedKey(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.map(
    (record) =>
      ({
        ...record,
        meta: { ...record.meta, key: record.meta?.key ?? normalizeKey },
        children: record.children ? withNormalizedKey(record.children) : record.children,
      }) as RouteRecordRaw,
  )
}

export default <RouterConfig>{
  routes: (routes) => withNormalizedKey(routes),
}
