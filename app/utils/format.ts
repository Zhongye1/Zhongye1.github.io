/** 右侧栏只有 300px 宽，五位数会撑破一格，压成「万」 */
export function formatNumber(value?: number | null) {
  if (value == null) return ''
  if (value < 10000) return String(value)
  // 1.0 万读起来别扭，去掉多余的 .0
  return `${(value / 10000).toFixed(1).replace(/\.0$/, '')} 万`
}

/**
 * `YYYY-MM-DD` 按本地时区解析。
 * 直接 `new Date('2023-09-12')` 会当成 UTC 零点，负时区下会退回前一天。
 */
function toLocalDate(value: string | Date) {
  if (value instanceof Date) return value

  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!matched) return new Date(value)

  return new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]))
}

/** 抹掉时分秒，只留当地日历日 */
function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * 从起始日期到 `until` 相差几天。
 *
 * 两端都先归到当地零点再相减；用 round 而不是 floor —— 区间里跨夏令时的话，
 * 两个零点之间并不是 24h 的整数倍，floor 会整体少一天。
 */
export function daysSince(start: string | Date, until: string | Date) {
  const from = startOfLocalDay(toLocalDate(start))
  const to = startOfLocalDay(toLocalDate(until))

  return Math.max(Math.round((to.getTime() - from.getTime()) / 86_400_000), 0)
}
