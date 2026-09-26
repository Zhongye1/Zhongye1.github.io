/**
 * `prefers-reduced-motion` helpers.
 *
 * The engine is framework-agnostic, so it exposes plain functions; the Vue layer
 * wraps them with `useMediaQuery` where it needs reactivity.
 */

export function isMotionReduced(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
