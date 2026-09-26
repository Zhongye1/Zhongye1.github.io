/**
 * Twikoo 评论云函数的 Worker 入口。
 *
 * 这里刻意不写业务：真正的适配器是 `./twikoo/index.js`（从 twikoo 仓库
 * `packages/server-cloudflare/dist/index.js` vendor 进来的构建产物，改动方式见 README）。
 * 它自带 `export default { fetch }`，且 handler 内部把异常压成业务失败体（返回 200 +
 * `{ code, message }`），所以这里直接转发即可，不需要再包一层 try/catch。
 *
 * `nodejs_compat` 在 wrangler.jsonc 里声明：公共层用到 node:crypto / Buffer。
 */
export { default } from './twikoo/index.js'
