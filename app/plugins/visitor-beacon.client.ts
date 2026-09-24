import { visitorApi } from '@/site.config'

/**
 * 访客埋点。
 *
 * 记的是**页面浏览**而不是会话：SPA 里切路由不会重新加载页面，只在插件初始化时
 * 发一次的话，读者点开十篇文章也只算一次。
 *
 * 两个必须守住的细节：
 *
 *   · 用 `sendBeacon` 而不是 `fetch`——它不阻塞渲染，也不怕用户在请求发出前
 *     就关掉标签页（那正是普通 fetch 会丢数据的时候）。
 *   · Blob 的 type 必须是 `text/plain`。只有 simple request 才不会触发 CORS 预检，
 *     而 beacon 压根不等预检结果——一旦触发预检，这条记录会被浏览器直接丢掉，
 *     且控制台里只有一行容易被忽略的 CORS 报错。
 */
export default defineNuxtPlugin(() => {
  if (!navigator.sendBeacon) return

  const route = useRoute()

  function report() {
    // 只发 path，不带 query：搜索词之类的参数没必要离开浏览器
    const body = new Blob([JSON.stringify({ path: route.path })], {
      type: 'text/plain;charset=UTF-8',
    })
    navigator.sendBeacon(`${visitorApi.base}/api/visit`, body)
  }

  // immediate 保证首次进入也记一次——路由的 afterEach 不会为初始路由触发
  watch(() => route.path, report, { immediate: true })
})
