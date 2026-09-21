interface FormatBytesOptions {
  decimals?: number
  binary?: boolean
  unitSeparator?: string
}

export function formatBytes(bytes: number, options: FormatBytesOptions = {}) {
  const { decimals = 2, binary = true, unitSeparator = ' ' } = options

  if (bytes === 0) return `0${unitSeparator}Bytes`

  const base = binary ? 1024 : 1000
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(base))
  const value = Number.parseFloat((bytes / base ** i).toFixed(decimals))

  return `${value}${unitSeparator}${units[i]}`
}

// 键统一写成 Unicode 转义，避免引号嵌套带来的可读性问题（\u0022 双引号、\u0027 单引号）
const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\u0022': '&quot;',
  '\u0027': '&#39;',
}

/** 首屏高亮尚未接管时，把代码原文安全地放进 HTML */
export function escapeHtml(text: string) {
  return text.replace(/[&<>\u0022']/g, (char) => htmlEscapeMap[char] ?? char)
}
