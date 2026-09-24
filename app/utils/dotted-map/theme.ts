import type { DottedMapPalette, DottedMapTheme } from './types'

const LIGHT_DEFAULTS: DottedMapPalette = {
  dotColor: 'rgba(234, 88, 12, 0.28)',
  globeFill: 'rgba(255, 251, 245, 0.95)',
  outlineColor: 'rgba(234, 88, 12, 0.12)',
  clusterBg: 'rgba(234, 88, 12, 0.92)',
  clusterText: '#ffffff',
  clusterBorder: 'rgba(255, 255, 255, 1)',
  activeGlow: 'rgba(249, 115, 22, 0.25)',
  activeBadge: '#22c55e',
}

const DARK_DEFAULTS: DottedMapPalette = {
  dotColor: 'rgba(249, 115, 22, 0.30)',
  globeFill: 'rgba(30, 32, 36, 0.95)',
  outlineColor: 'rgba(249, 115, 22, 0.15)',
  clusterBg: 'rgba(249, 115, 22, 0.90)',
  clusterText: '#ffffff',
  clusterBorder: 'rgba(26, 27, 30, 1)',
  activeGlow: 'rgba(249, 115, 22, 0.25)',
  activeBadge: '#22c55e',
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
