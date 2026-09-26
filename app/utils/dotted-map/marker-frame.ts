import type { DottedMapMarkerFrame } from './types'

/**
 * Apply one frame of positioning to a marker wrapper.
 *
 * Runs up to 60× per second per marker, so it only ever touches `style` — never
 * a reactive value. That is the whole reason the engine keeps its render state
 * in plain objects instead of refs.
 */
export function applyMarkerFrame(frame: DottedMapMarkerFrame): void {
  const scale = frame.tSize > 0 ? Math.min(1, frame.size / frame.tSize) : 1
  frame.el.style.display = ''
  frame.el.style.opacity = String(frame.alpha)
  frame.el.style.transform = `translate(${frame.x}px, ${frame.y}px) translate(-50%, -50%) scale(${scale})`
}
