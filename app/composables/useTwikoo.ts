import { twikoo } from '@/site.config'

/** twikoo 脚本现状：等脚本 → 等 init。`error` 是唯一需要渲染到页面上的终态 */
export type TwikooStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * 同一个页面里可能挂多个评论区实例（文章页 + 将来别处），脚本只能插一次、
 * 加载也只能等同一个 promise —— 状态与 promise 因此留在模块级，不随组件生灭。
 */
let scriptPromise: Promise<void> | null = null
const status = ref<TwikooStatus>('idle')
const errorMessage = ref('')

/** twikoo 1.x/2.x 的 UMD 产物把 API 挂在 window.twikoo 上，本仓库当前的用度只需要 init */
interface TwikooGlobal {
  init: (options: { envId: string; el: string }) => void
}

declare global {
  interface Window {
    twikoo?: TwikooGlobal
  }
}

/**
 * 已经插过的 script 元素。
 *
 * 比较时把协议摘掉：`site.config` 里写的是 https 绝对地址，而浏览器在 `src` 属性上
 * 回读的是它解析后的形态，两者在不同写法下不一致，摘掉协议再比最省事。
 */
function findLoadedScript(url: string): HTMLScriptElement | undefined {
  const target = url.replace(/^https?:/, '')
  return [...document.querySelectorAll<HTMLScriptElement>('script[src]')].find(
    (script) => script.src.replace(/^https?:/, '') === target,
  )
}

/**
 * 插入 twikoo 脚本，加载完成才 resolve。
 *
 * 这里刻意不用 `<script defer>` + 随后 `window.twikoo?.init?.()` 的写法（参考实现
 * `blog-v3` 是那样做的）：`defer` 脚本与 `onMounted` 的先后顺序没有保证，CDN 慢的时候
 * `window.twikoo` 还是 undefined，可选链会**静默跳过**，评论区永远停在「加载中」，
 * 而刷新一次（脚本已进缓存）又恢复正常 —— 这种「刷新就好」的故障最难查。
 * 用 promise 把「脚本就绪」变成显式契约，失败也会走到 error 态。
 * @param url 脚本地址
 * @returns 加载完成的 promise
 */
function loadScript(url: string): Promise<void> {
  const existing = findLoadedScript(url)
  if (existing) {
    // 元素在、但全局变量没挂上：脚本被别的路径加载失败过，重插一次没意义，直接报错
    if (window.twikoo) return Promise.resolve()
    return Promise.reject(new Error('twikoo 脚本已存在，但未挂载 window.twikoo'))
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () =>
        reject(
          new Error(
            `twikoo 前端脚本加载失败：${url}\n（CDN 不可达或被拦截；自托管可改 site.config 的 twikoo.script）`,
          ),
        ),
      { once: true },
    )
    document.head.append(script)
  })
}

/**
 * twikoo 评论区的加载与初始化。
 *
 * 两件事分开暴露：组件拿 `status` 渲染占位，拿 `init` 挂载评论区。
 */
export function useTwikoo() {
  /**
   * 确保脚本就绪（幂等：多次调用共用同一个 promise）。
   * @returns 脚本可用的 promise
   */
  function ensureScript(): Promise<void> {
    if (window.twikoo) {
      status.value = 'ready'
      return Promise.resolve()
    }

    scriptPromise ??= loadScript(twikoo.script).then(
      () => {
        status.value = 'ready'
      },
      (error: unknown) => {
        status.value = 'error'
        errorMessage.value = error instanceof Error ? error.message : String(error)
        // promise 本身不保留失败态：下一次挂载（换篇文章）应当重试，而不是一直吃旧拒绝
        scriptPromise = null
        throw error
      },
    )

    status.value = 'loading'
    return scriptPromise
  }

  /**
   * 把评论区挂到容器上。
   *
   * 不 await twikoo.init 的返回值：它是异步的，但 DOM 是同步挂载的，界面渲染不需要等它。
   * 同步异常（容器选择器写错、twikoo 内部早期报错）必须在这里接住 —— twikoo 自己只把
   * **请求失败**渲染成 `TkError`，挂载失败是抛出来的。
   * @param containerId 容器元素 id（带 `#`）
   */
  function init(containerId: string): void {
    try {
      window.twikoo?.init({ envId: twikoo.envId, el: containerId })
    } catch (error) {
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : String(error)
    }
  }

  return { status: readonly(status), errorMessage: readonly(errorMessage), ensureScript, init }
}
