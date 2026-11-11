/**
 * FNV-1a 32-bit，把图片地址 / Mermaid 源码压成短 key。
 * 只用于预览深链的标识，不需要密码学强度。
 */
export function hashString(value: string) {
  let hash = 0x811c9dc5

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0).toString(36)
}
