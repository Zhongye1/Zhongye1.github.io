import type { DottedMapPalette, DottedMapTheme } from './types'

// 地图上所有「点」共用一个主色：底图大陆点阵是它的淡版，城市点与聚合气泡是实色，
// 选中态也只靠同色的光晕区分，不换色。
//
// 色值对齐 color.scss 的 --c-primary（hue 215），明暗两套一一对应：
// 亮色 hsl(215 100% 54%)、暗色 hsl(215 90% 68%)。canvas 读不到 CSS 变量，
// 只能在这里写具体值，故用 hsla() 老语法（canvas 对它的支持面最广）。
const LIGHT_DEFAULTS: DottedMapPalette = {
  dotColor: 'hsla(215, 100%, 54%, 0.28)',
  globeFill: 'hsla(215, 20%, 98%, 0.95)',
  outlineColor: 'hsla(215, 100%, 54%, 0.12)',
  clusterBg: 'hsla(215, 100%, 54%, 1)',
  clusterText: '#ffffff',
  clusterBorder: 'rgba(255, 255, 255, 1)',
  activeGlow: 'hsla(215, 100%, 54%, 0.25)',
  activeBadge: 'hsla(215, 100%, 54%, 1)',
}

const DARK_DEFAULTS: DottedMapPalette = {
  dotColor: 'hsla(215, 90%, 68%, 0.30)',
  globeFill: 'hsla(215, 10%, 13%, 0.95)',
  outlineColor: 'hsla(215, 90%, 68%, 0.15)',
  clusterBg: 'hsla(215, 90%, 68%, 1)',
  clusterText: '#ffffff',
  clusterBorder: 'rgba(26, 27, 30, 1)',
  activeGlow: 'hsla(215, 90%, 68%, 0.25)',
  activeBadge: 'hsla(215, 90%, 68%, 1)',
}

export function resolveTheme(isDark: boolean, overrides?: DottedMapTheme): DottedMapPalette {
  const base = isDark ? DARK_DEFAULTS : LIGHT_DEFAULTS
  if (!overrides) return base

  return {
    dotColor: overrides.dotColor ?? base.dotColor,
    globeFill: overrides.globeFill ?? base.globeFill,
    outlineColor: overrides.outlineColor ?? base.outlineColor,
    clusterBg: overrides.clusterColor ?? base.clusterBg,
    clusterText: overrides.clusterTextColor ?? base.clusterText,
    clusterBorder: overrides.clusterBorderColor ?? base.clusterBorder,
    activeGlow: overrides.activeGlow ?? base.activeGlow,
    activeBadge: overrides.activeBadgeColor ?? base.activeBadge,
  }
}
