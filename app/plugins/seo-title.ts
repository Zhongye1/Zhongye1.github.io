import siteConfig from '@/site.config'

/**
 * 标题模板统一入口。
 *
 * nuxt-seo-utils 会在运行时（`applyDefaults`）注册 `%s %separator %siteName` 模板，
 * 它比 nuxt.config 的 `app.head.titleTemplate` 入队更晚，会把配置里那份盖掉 —— 于是
 * 首页标题变成「Zhongye | Zhongye」。这里在插件里再注册一次拿回控制权：
 * 只有存在子标题时才追加站点名，首页就是站点名本身。
 */
export default defineNuxtPlugin(() => {
  useHead({
    titleTemplate: (chunk?: string) =>
      !chunk || chunk === siteConfig.title ? siteConfig.title : `${chunk} - ${siteConfig.title}`,
  })
})
