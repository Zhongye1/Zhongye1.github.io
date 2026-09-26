import siteIco from '@/assets/ico/site.ico'

/**
 * 站点图标（浏览器标签页 / 收藏夹 / 订阅器里显示的那个 logo）。
 *
 * 图标放在 `app/assets/ico/` 而不是 `public/`，所以 URL 由打包器生成、带内容哈希：
 * 换图标后浏览器不会继续吃旧缓存，不用手动改文件名破缓存。
 *
 * 为什么不写在 nuxt.config 的 `app.head` 里：nuxt.config 由 jiti 加载，不经过 Vite，
 * 在那边 `import` 一个二进制文件会直接报错。只有走打包器的文件（插件 / 组件）才能这样引。
 */
export default defineNuxtPlugin(() => {
  useHead({
    link: [{ rel: 'icon', type: 'image/x-icon', href: siteIco }],
  })
})
