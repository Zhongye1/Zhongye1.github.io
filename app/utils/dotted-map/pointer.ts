import type { DottedMapEngine } from './engine'
import type { DottedMapMarkerCluster } from './types'

export interface DottedMapPointerOptions {
  engine: DottedMapEngine
  container: HTMLElement
  onMarkerClick?: (cluster: DottedMapMarkerCluster) => void
}

export interface DottedMapPointerHandle {
  onPointerDown(event: PointerEvent): void
  onPointerMove(event: PointerEvent): void
  onPointerUp(event: PointerEvent): void
  onPointerLeave(event: PointerEvent): void
  onWheel(event: WheelEvent): void
  onClick(event: MouseEvent): void
  /** True while the last gesture moved far enough to count as a drag, not a click. */
  hasDragged(): boolean
}

/**
 * Unified pointer handling.
 *
 * Replaces the upstream React component's parallel mouse + touch handler pairs
 * with a single PointerEvent path, and keeps every mutable drag value out of
 * Vue's reactivity (a ref here would re-render the component on every frame).
 */
export function createDottedMapPointer(options: DottedMapPointerOptions): DottedMapPointerHandle {
  const { engine, container, onMarkerClick } = options

  let dragging = false
  let dragged = false
  const last: [number, number] = [0, 0]

  /** A click never counts as a drag below this much movement (px). */
  const DRAG_THRESHOLD = 3

  function localPoint(clientX: number, clientY: number): [number, number] {
    const rect = container.getBoundingClientRect()
    return [clientX - rect.left, clientY - rect.top]
  }

  return {
    onPointerDown(event) {
      // Ignore secondary buttons so context menus keep working.
      if (event.button !== 0) return
      dragging = true
      dragged = false
      last[0] = event.clientX
      last[1] = event.clientY
      container.setPointerCapture?.(event.pointerId)
      container.style.cursor = 'grabbing'
      engine.beginDrag()
    },

    onPointerMove(event) {
      const [mx, my] = localPoint(event.clientX, event.clientY)

      if (!dragging) {
        container.style.cursor = engine.hitTest(mx, my) ? 'pointer' : 'grab'
        return
      }

      const dx = event.clientX - last[0]
      const dy = event.clientY - last[1]
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) dragged = true
      last[0] = event.clientX
      last[1] = event.clientY

      engine.dragBy(dx, dy)
    },

    onPointerUp(event) {
      if (!dragging) return
      dragging = false
      container.releasePointerCapture?.(event.pointerId)
      container.style.cursor = 'grab'
      engine.endDrag()
    },

    onPointerLeave(event) {
      container.style.cursor = 'grab'
      if (!dragging) return
      dragging = false
      container.releasePointerCapture?.(event.pointerId)
      engine.endDrag()
    },

    onWheel(event) {
      event.preventDefault()
      engine.zoomByFactor(1 - event.deltaY * 0.003)
    },

    onClick(event) {
      // A drag that ended on a marker must not fire a click.
      if (dragged || !onMarkerClick) return
      const [mx, my] = localPoint(event.clientX, event.clientY)
      const hit = engine.hitTest(mx, my)
      if (hit) onMarkerClick({ markers: hit.markers, x: hit.x, y: hit.y, radius: hit.radius })
    },

    hasDragged: () => dragged,
  }
}
