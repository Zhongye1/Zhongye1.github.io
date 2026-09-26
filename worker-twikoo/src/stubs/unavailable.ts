/**
 * Workers 上不存在、又必须让打包器解析得到的可选依赖，统一指向这个 stub。
 *
 * 公共层（`@twikoojs/common`）的重依赖表用的是**字面量** `import()`：
 *
 *   nodemailer: () => import("nodemailer"),
 *   lokijs:     () => import("lokijs"),
 *   …
 *
 * 字面量是刻意为之（specifier 一旦是变量就无法被静态追踪，依赖会漏进产物），代价是
 * 打包器必须能解析每一个 specifier —— 哪怕该分支在 Cloudflare 上永远不会执行。
 * 于是 esbuild 报 16 个 `Could not resolve`，部署直接失败。
 *
 * 处理办法分两类：
 *
 * 1. **真会用到** → 装依赖（见 package.json：marked / bowser / html-to-text / xml2js / pushoo）；
 * 2. **本平台不可用** → 在 wrangler.jsonc 的 `alias` 里指到这个文件。
 *
 * 第 2 类包括：SMTP 的 nodemailer、jsdom + dompurify、ip2region 的 8.33 MB db、
 * akismet、腾讯云 TMS、Node 流的 form-data、xsai，以及本平台不上场的
 * mongodb / lokijs 本地库模式。它们各自都有适配器的 `setCustomLibs` 覆写顶在前面
 * （见 `../twikoo/index.js` 的 `installCloudflareLibs`）。
 *
 * **为什么必须是「能解析、但一碰就炸」，而不是静默空对象**：覆写一旦失效
 * （比如上游改了 `setCustomLibs` 的键名），静默 stub 会把故障退化成「邮件悄悄不发」
 * 这种没人发现的样子；抛错则会在首个请求上直接暴露。
 */

/**
 * 取属性 / 调用 / `new` 三条路都抛错的对象。
 *
 * 必须是「返回函数」而不是在模块求值时抛：公共层的用法是
 * `pickDefault(await loadLib(x))` 之后再 `new`，错误要留到真正调用那一刻，
 * 栈才指向调用方。
 * @param name 被访问的包名（错误消息里点名）
 * @returns 该包的替身
 */
function unreachable(name: string) {
  const boom = (): never => {
    throw new Error(
      `${name} 在 Cloudflare Workers 上不可用，且本次调用没有被适配器的 setCustomLibs 覆写接住。` +
        `请检查 @twikoojs/cloudflare 的 installCloudflareLibs 是否覆盖了该能力。`,
    )
  }
  // 目标用函数，get / apply / construct 三个陷阱才都在，`new X()` 与 `X()` 都能接住。
  // get 陷阱的 key 用不上（不区分成员，一律抛），故按约定加下划线前缀。
  return new Proxy(boom, {
    get: (_target, _key) => boom(),
    apply: () => boom(),
    construct: () => boom(),
  })
}

/**
 * 默认导出：函数形态（对应 `pickDefault(await loadLib("nodemailer"))` 的取用方式）。
 * @returns 该包的替身
 */
export default function stubDefault() {
  return unreachable('该依赖')
}

/** 供 `lokijs` 与 `lokijs/src/loki-fs-structured-adapter.js` 这类子路径共用 */
export const LokiFsStructuredAdapter = unreachable('lokijs')
