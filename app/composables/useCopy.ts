import type { MaybeComputedElementRef } from '@vueuse/core'

/**
 * 点击触发元素时把文本复制到剪贴板。
 * @param target 提供复制文本的元素、组件实例或字符串
 */
export default function useCopy(target: MaybeComputedElementRef | string) {
  function getText() {
    if (typeof target === 'string') return target

    const el = unrefElement(target)
    if (el instanceof HTMLInputElement) return el.value
    return el?.textContent || ''
  }

  return useClipboard({ source: getText, legacy: true })
}
