/**
 * 分页的纯计算：总页数、越界钳制、页码序列。
 */

/** 页码钳制到 [1, totalPages]；非数字（NaN）回落到第 1 页 */
export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(Math.trunc(page), 1), Math.max(totalPages, 1))
}

/** 总页数，至少 1 */
export function countPages(total: number, perPage: number): number {
  if (perPage <= 0) return 1
  return Math.max(Math.ceil(total / perPage), 1)
}

/**
 * 生成要显示的页码序列。
 *
 * @param current 当前页
 * @param total 总页数
 * @param expand 当前页两侧各展开几个页码
 * @returns 页码数组；`Number.NEGATIVE_INFINITY` / `Number.POSITIVE_INFINITY` 表示省略号位置
 */
export function getPaginationIndicator(current: number, total: number, expand = 2): number[] {
  if (total <= 1) return total === 1 ? [1] : []

  const start = Math.max(2, Math.min(current - expand, total - 2 * expand))
  const end = Math.min(total, start + 2 * expand)
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index)

  // 开头：隔了 3 页以上才有必要省略
  if (start > 3) pages.unshift(Number.NEGATIVE_INFINITY)
  if (start === 3) pages.unshift(2)
  if (start > 1) pages.unshift(1)

  // 结尾同理
  if (end < total - 2) pages.push(Number.POSITIVE_INFINITY)
  if (end === total - 2) pages.push(total - 1)
  if (end < total) pages.push(total)

  return pages
}
