import { useDark } from '@vueuse/core'
import { nextTick } from 'vue'
import { themeStorageKey } from '@/site.config'

/** 揭示进行中挂在 <html> 上的标记类；方向修饰类见 theme-reveal.scss 里的 `.theme-reveal-to-dark` */
const REVEAL_CLASS = 'theme-transitioning'
const REVEAL_TO_DARK_CLASS = 'theme-reveal-to-dark'

/**
 * 圆形揭示的圆心。
 *
 * 鼠标点击有坐标，直接用；键盘触发（Enter / 空格）拿不到坐标，退到当前焦点元素的中心
 * ——正在聚焦的就是那颗开关；再不行才用视口中心，保证读屏用户也能看到动画从「自己所在的位置」开始。
 */
function revealOrigin(event?: Event) {
  if (event instanceof MouseEvent && (event.clientX || event.clientY)) {
    return { x: event.clientX, y: event.clientY }
  }

  const active = document.activeElement
  if (
    active instanceof HTMLElement &&
    active !== document.body &&
    active !== document.documentElement
  ) {
    const rect = active.getBoundingClientRect()
    if (rect.width || rect.height) {
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    }
  }

  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

/** 收尾：摘掉标记类，并把这次算出来的圆心 / 半径从 <html> 上清掉 */
function endReveal() {
  const root = document.documentElement
  root.classList.remove(REVEAL_CLASS, REVEAL_TO_DARK_CLASS)
  root.style.removeProperty('--reveal-x')
  root.style.removeProperty('--reveal-y')
  root.style.removeProperty('--reveal-r')
}

/**
 * 「减少动态效果」的媒体查询。每次切换都新建一个 MediaQueryList 没必要，建一次复用；
 * 惰性创建是因为这个模块在服务端也会被加载，那边没有 window。
 */
let reducedMotionQuery: MediaQueryList | undefined

function prefersReducedMotion() {
  reducedMotionQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)')
  return reducedMotionQuery.matches
}

/**
 * 站点明暗主题，以及切换时的过渡动画。
 *
 * 切换走 View Transitions API：浏览器在换配色前后各拍一张整页快照，默认是交叉淡入淡出。
 * 这里把它改成「从点击处扩散 / 收拢的圆形揭示」——动画本体写在 assets/css/theme-reveal.scss
 *（为什么不能像常见写法那样用 WAAPI 在 ready 里挂，那个文件头部说清楚了），
 * 这里只负责在开转场之前把圆心、半径和方向落到 <html> 上。
 * 浏览器不支持该 API、或用户开了「减少动态效果」时直接切主题，功能不受影响。
 */
export function useTheme() {
  const isDark = useDark({
    // 与 nuxt.config.ts 里那段内联脚本共用同一个键：它负责首帧，这里负责之后的交互
    storageKey: themeStorageKey,
    // VueUse 默认 disableTransition: true，会在切主题时往 <head> 插一段
    // `*,*::before,*::after{transition:none!important}` 再删掉，免得整页配色慢慢淡过去。
    // 但那个 watcher 是 flush: 'post'，跑在组件更新之后 —— 昼夜开关那颗球刚起步的 1.2s 过渡
    // 会被它当场取消（属性直接跳到终点），表现就是「点一下瞬间切过去、没有动画」。
    // 关掉它开关的过渡才活下来；代价是整页配色也跟着过渡，而站内最长的过渡只有 0.25s。
    disableTransition: false,
  })

  /**
   * 切到指定主题。
   * @param next 目标状态，true 为夜间
   * @param event 触发它的那次交互，用来决定圆形揭示从哪开始
   */
  function setTheme(next: boolean, event?: Event) {
    // 状态没变就别开转场：连点两下、或别处刚切过，都会走到这里
    if (next === isDark.value) return

    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      isDark.value = next
      return
    }

    const root = document.documentElement
    const { x, y } = revealOrigin(event)
    // 圆要盖住整屏：半径取圆心到最远的那个角
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    // 圆心 / 半径 / 方向必须在 startViewTransition 之前落好：快照伪元素是那一刻建出来的，
    // 揭示动画又写在样式表里（main.scss 的 @keyframes theme-reveal-*）。晚一步的话，伪元素会先按
    // 「没裁切」画一帧 —— 变日间时那一帧就是整屏新快照（白），看着就是先全白再展开。
    root.style.setProperty('--reveal-x', `${x}px`)
    root.style.setProperty('--reveal-y', `${y}px`)
    root.style.setProperty('--reveal-r', `${radius}px`)
    root.classList.toggle(REVEAL_TO_DARK_CLASS, next)
    root.classList.add(REVEAL_CLASS)

    // 拍「新」快照前必须让 html.dark 已经落到 DOM 上，而 useDark 写类名是 flush: 'post'，
    // 所以要等一个 tick 再让回调返回；否则新旧两张快照是同一套配色，动画等于没做。
    const transition = document.startViewTransition(async () => {
      isDark.value = next
      await nextTick()
    })

    // finished 正常结束和被跳过都会 settle；两个分支都接上，免得 reject 漏成 unhandled rejection
    transition.finished.then(endReveal, endReveal)
  }

  return { isDark, setTheme }
}
