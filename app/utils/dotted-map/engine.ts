import { clusterByGeo } from './clustering'
import { isMotionReduced } from './motion'
import { LAND_POINTS } from './land-points'
import { resolveTheme } from './theme'
import type {
  DottedMapAnimCluster,
  DottedMapGeoCluster,
  DottedMapHitTarget,
  DottedMapMarker,
  DottedMapMarkerFrame,
  DottedMapTheme,
  DottedMapViewMode,
} from './types'
export type { DottedMapHitTarget }

const DEG = Math.PI / 180
const TWO_PI = Math.PI * 2

/** Screen-space merge distance — phase 2 of clustering. */
const MERGE_DIST = 50
/** Proximity radius used to match a cluster across frames, so it morphs instead of jumping. */
const MATCH_DIST = 80
/** Minimum canvas-space radius so a lone land dot stays visible on tiny maps. */
const MIN_DOT_RADIUS = 1.4
/** Zoom ceiling for the globe; past this the orthographic projection looks broken. */
const MAX_GLOBE_ZOOM = 3
const MAX_TILT_DEG = 60

const DOT_FONT = 'bold 12px -apple-system, system-ui, sans-serif'
const BADGE_FONT = 'bold 7px -apple-system, system-ui, sans-serif'

export interface DottedMapEngineOptions {
  container: HTMLElement
  canvas: HTMLCanvasElement
  markers: DottedMapMarker[]
  activeMarkerIds: Set<string>
  viewMode: DottedMapViewMode
  theme?: DottedMapTheme
  initialRotation: [number, number]
  initialZoom?: number
  autoRotate?: boolean
  zoomRange?: [number, number]
  clusterCellDegrees?: number
  /** Markers the view layer is willing to host in a slot. Others are painted on canvas. */
  getSlotMarkers: () => Set<string>
  /** Latest marker wrappers mounted by the view layer, keyed by geo-cluster index. */
  getClusterEls: () => Map<number, HTMLElement>
  /** Called once per frame for each solo marker the view layer must position. */
  onMarkerFrame?: (frame: DottedMapMarkerFrame) => void
  onMarkerClick?: (cluster: DottedMapHitTarget) => void
  /** Fired when zoom changes the adaptive geo-grid size, so the view layer can re-key slots. */
  onCellDegreesChange?: (cellDegrees: number) => void
}

export interface DottedMapEngine {
  start(): void
  destroy(): void
  /** Pause the rAF loop (tab hidden / scrolled out of view). */
  setActive(active: boolean): void
  setTheme(theme: DottedMapTheme | undefined, isDark: boolean): void
  setAutoRotate(enabled: boolean): void
  setMarkers(markers: DottedMapMarker[]): void
  setActiveMarkerIds(ids: Set<string>): void
  setViewMode(mode: DottedMapViewMode): void
  /** Begin a drag gesture. While dragging, cluster transitions snap instead of easing. */
  beginDrag(): void
  /** Apply one drag delta in CSS pixels (from the pointer controller). */
  dragBy(dx: number, dy: number): void
  /** End a drag, converting the last delta into release momentum. */
  endDrag(): void
  /** Multiply the zoom target by `factor` (wheel/trackpad). */
  zoomByFactor(factor: number): void
  /** Hit-test in container-local CSS pixels. Returns the cluster under the point, if any. */
  hitTest(x: number, y: number): DottedMapHitTarget | undefined
  /**
   * Current geo-clusters. The returned array is rebuilt in place as zoom changes
   * the adaptive grid — treat it as read-only and never put it in a ref.
   */
  getGeoClusters(): DottedMapGeoCluster[]
  zoomIn(): void
  zoomOut(): void
  getZoom(): number
  /** Re-measure the container canvas. Cheap enough to call on every resize tick. */
  resize(): void
  /** Reset rotation, tilt, pan and zoom, dropping any momentum. */
  resetView(): void
  /** Jump straight to the target of the current view-mode transition (skips the animation). */
  settle(): void
  getViewMode(): DottedMapViewMode
}

export function createDottedMapEngine(options: DottedMapEngineOptions): DottedMapEngine {
  const {
    container,
    canvas,
    initialRotation,
    initialZoom = 1,
    zoomRange = [0.5, 6],
    getSlotMarkers,
    getClusterEls,
    onMarkerFrame,
    onCellDegreesChange,
  } = options

  const context = canvas.getContext('2d')
  if (!context) throw new Error('[dotted-map] 2D canvas context unavailable')
  // Bind to a non-nullable const so the closures below keep the narrowed type.
  const ctx: CanvasRenderingContext2D = context

  let markers = options.markers
  let activeMarkerIds = options.activeMarkerIds
  let viewMode = options.viewMode
  let autoRotate = options.autoRotate ?? true
  /** Once the user grabs the globe, the idle spin stays off (matches upstream behaviour). */
  let pausedByDrag = false
  let palette = resolveTheme(false, options.theme)

  // ---- Mutable render state (deliberately outside any reactivity) ----
  const rotation: [number, number, number] = [initialRotation[0], initialRotation[1], 0]
  const pan = { x: 0, y: 0 }
  const velocity = { x: 0, y: 0 }
  let zoom = initialZoom
  let targetZoom = initialZoom
  /** 0 = flat, 1 = globe. Animated toward `targetTransition`. */
  let transition = viewMode === 'globe' ? 1 : 0
  let targetTransition = transition
  let dragging = false
  let cellDegrees = options.clusterCellDegrees ?? 15

  let width = 0
  let height = 0
  let rafId = 0
  let active = true
  let destroyed = false
  let resizeObserver: ResizeObserver | null = null

  let geoClusters: DottedMapGeoCluster[] = []
  let animClusters: DottedMapAnimCluster[] = []
  let hitTargets: DottedMapHitTarget[] = []

  // Precomputed spherical terms, so the frame loop only does multiply-adds.
  const landPoints = LAND_POINTS.map(([lng, lat]) => ({
    cosLat: Math.cos(lat * DEG),
    sinLat: Math.sin(lat * DEG),
    lambda: lng * DEG,
    lng,
    lat,
  }))

  // ---- Clustering ----

  function rebuildClusters(): void {
    geoClusters = clusterByGeo(markers, cellDegrees, activeMarkerIds)
    // Cluster identities changed — restart their entry animation.
    animClusters = []
  }

  // ---- Per-frame state advance ----

  function advanceState(): void {
    if (Math.abs(transition - targetTransition) > 0.001) {
      transition += (targetTransition - transition) * 0.06
    } else {
      transition = targetTransition
    }

    if (Math.abs(targetZoom - zoom) > 0.001) {
      zoom += (targetZoom - zoom) * 0.2
    } else {
      zoom = targetZoom
    }

    const nextCellDegrees = options.clusterCellDegrees ?? Math.max(2, Math.round(15 / zoom))
    if (nextCellDegrees !== cellDegrees) {
      cellDegrees = nextCellDegrees
      rebuildClusters()
      onCellDegreesChange?.(cellDegrees)
    }

    // Momentum: spin the globe, or pan the flat map, then decay.
    if (!dragging && (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01)) {
      if (transition > 0.5) {
        rotation[0] += velocity.x
        rotation[1] += velocity.y
      } else {
        pan.x += velocity.x * 2
        pan.y += velocity.y * 2
      }
      velocity.x *= 0.93
      velocity.y *= 0.93
    }

    if (autoRotate && !pausedByDrag && transition > 0.5 && !dragging) {
      rotation[0] += 0.15
    }

    rotation[1] = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, rotation[1]))

    if (transition < 0.5) {
      // Keep the flat map from drifting entirely out of frame.
      const factor = flatScale() * DEG
      const maxPanX = Math.max(0, factor * 180 - width / 2)
      const maxPanY = Math.max(0, factor * 80 - height / 2)
      pan.x = Math.max(-maxPanX, Math.min(maxPanX, pan.x))
      pan.y = Math.max(-maxPanY, Math.min(maxPanY, pan.y))
    }
  }

  // ---- Geometry ----

  function flatScale(): number {
    return (height / 2.2) * zoom
  }

  function globeRadius(): number {
    return Math.min(width, height) * 0.42 * zoom
  }

  function dotRadius(): number {
    return Math.max(MIN_DOT_RADIUS, (width / 380) * Math.min(zoom, 2))
  }

  function maxZoom(): number {
    const [, max] = zoomRange
    return viewMode === 'globe' ? Math.min(max, MAX_GLOBE_ZOOM) : max
  }

  // ---- Draw ----

  function drawLandDots(t: number): void {
    const radius = dotRadius()
    const factor = flatScale() * DEG
    const flatCx = width / 2 + pan.x * (1 - t)
    const flatCy = height / 2 + pan.y * (1 - t)
    const lambda0 = -rotation[0] * DEG
    const phi0 = -rotation[1] * DEG
    const cosPhi0 = Math.cos(phi0)
    const sinPhi0 = Math.sin(phi0)
    const globeCx = width / 2
    const globeCy = height / 2
    const globeR = globeRadius()

    ctx.fillStyle = palette.dotColor
    ctx.beginPath()

    for (let i = 0; i < landPoints.length; i++) {
      const p = landPoints[i]!
      const fx = flatCx + factor * p.lng
      const fy = flatCy - factor * p.lat

      if (t < 0.01) {
        if (fx < -10 || fx > width + 10 || fy < -10 || fy > height + 10) continue
        ctx.moveTo(fx + radius, fy)
        ctx.arc(fx, fy, radius, 0, TWO_PI)
        continue
      }

      const lambdaRel = p.lambda - lambda0
      const cosLambdaRel = Math.cos(lambdaRel)
      // Back-face culling: skip points on the far side of the globe.
      const cosC = sinPhi0 * p.sinLat + cosPhi0 * p.cosLat * cosLambdaRel
      if (cosC < 0) continue

      const gx = globeCx + globeR * p.cosLat * Math.sin(lambdaRel)
      const gy = globeCy - globeR * (cosPhi0 * p.sinLat - sinPhi0 * p.cosLat * cosLambdaRel)

      if (t > 0.99) {
        ctx.moveTo(gx + radius, gy)
        ctx.arc(gx, gy, radius, 0, TWO_PI)
      } else {
        const x = fx + (gx - fx) * t
        const y = fy + (gy - fy) * t
        ctx.moveTo(x + radius, y)
        ctx.arc(x, y, radius, 0, TWO_PI)
      }
    }

    ctx.fill()
  }

  function drawGlobeBackdrop(t: number): void {
    if (t <= 0.01) return
    ctx.globalAlpha = t
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, globeRadius(), 0, TWO_PI)
    ctx.fillStyle = palette.globeFill
    ctx.fill()
    ctx.strokeStyle = palette.outlineColor
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  interface Projected {
    px: number
    py: number
    markers: DottedMapMarker[]
    hasActive: boolean
    activeCount: number
    sourceIndices: number[]
  }

  /** Phase 2: merge clusters that land within `MERGE_DIST` px of each other. */
  function mergeScreenClusters(projected: Projected[]): Projected[] {
    const minDistSq = MERGE_DIST * MERGE_DIST
    const merged: Projected[] = []
    const used = new Uint8Array(projected.length)

    for (let i = 0; i < projected.length; i++) {
      if (used[i]) continue
      const head = projected[i]!
      const m: Projected = {
        ...head,
        markers: [...head.markers],
        sourceIndices: [...head.sourceIndices],
      }
      let totalX = m.px * m.markers.length
      let totalY = m.py * m.markers.length
      let totalCount = m.markers.length

      for (let j = i + 1; j < projected.length; j++) {
        if (used[j]) continue
        const other = projected[j]!
        const dx = m.px - other.px
        const dy = m.py - other.py
        if (dx * dx + dy * dy >= minDistSq) continue

        used[j] = 1
        const otherCount = other.markers.length
        totalX += other.px * otherCount
        totalY += other.py * otherCount
        totalCount += otherCount
        m.markers.push(...other.markers)
        m.sourceIndices.push(...other.sourceIndices)
        if (other.hasActive) m.hasActive = true
        m.activeCount += other.activeCount
        m.px = totalX / totalCount
        m.py = totalY / totalCount
      }

      merged.push(m)
    }

    return merged
  }

  /** Carry clusters over from the previous frame so they morph instead of popping. */
  function reconcileAnimClusters(merged: Projected[]): DottedMapAnimCluster[] {
    const prev = animClusters
    const next: DottedMapAnimCluster[] = []
    const matchedPrev = new Uint8Array(prev.length)
    const lerp = dragging ? 0.5 : 0.15
    const maxMatchSq = MATCH_DIST * MATCH_DIST

    for (const m of merged) {
      const count = m.markers.length
      const isSolo = count === 1
      const targetSize = isSolo ? 16 : Math.min(14 + count * 0.4, 28)

      let bestIdx = -1
      let bestDistSq = maxMatchSq
      for (let pi = 0; pi < prev.length; pi++) {
        if (matchedPrev[pi]) continue
        const p = prev[pi]!
        const dx = p.tx - m.px
        const dy = p.ty - m.py
        const distSq = dx * dx + dy * dy
        if (distSq < bestDistSq) {
          bestDistSq = distSq
          bestIdx = pi
        }
      }

      if (bestIdx >= 0) {
        matchedPrev[bestIdx] = 1
        const p = prev[bestIdx]!
        next.push({
          x: p.x + (m.px - p.x) * lerp,
          y: p.y + (m.py - p.y) * lerp,
          tx: m.px,
          ty: m.py,
          size: p.size + (targetSize - p.size) * lerp,
          tSize: targetSize,
          count: p.count + (count - p.count) * lerp,
          tCount: count,
          alpha: p.alpha + (1 - p.alpha) * lerp,
          tAlpha: 1,
          markers: m.markers,
          hasActive: m.hasActive,
          activeCount: m.activeCount,
          sourceIndices: m.sourceIndices,
          isSolo,
        })
      } else {
        next.push({
          x: m.px,
          y: m.py,
          tx: m.px,
          ty: m.py,
          size: targetSize * 0.3,
          tSize: targetSize,
          count,
          tCount: count,
          alpha: 0.2,
          tAlpha: 1,
          markers: m.markers,
          hasActive: m.hasActive,
          activeCount: m.activeCount,
          sourceIndices: m.sourceIndices,
          isSolo,
        })
      }
    }

    // Fade out clusters that no longer exist.
    for (let pi = 0; pi < prev.length; pi++) {
      if (matchedPrev[pi]) continue
      const p = prev[pi]!
      const alpha = p.alpha * 0.8
      if (alpha < 0.05) continue
      next.push({ ...p, alpha, tAlpha: 0, size: p.size * 0.9 })
    }

    return next
  }

  function paintClusterBubble(ac: DottedMapAnimCluster, now: number): void {
    const { x, y, size } = ac
    ctx.globalAlpha = ac.alpha

    if (ac.hasActive && ac.tAlpha > 0) {
      const pulse = 1 + 0.15 * Math.sin((now / 600) * Math.PI)
      ctx.beginPath()
      ctx.arc(x, y, size * 1.2 * pulse, 0, TWO_PI)
      ctx.fillStyle = palette.activeGlow
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(x, y, size, 0, TWO_PI)
    ctx.fillStyle = palette.clusterBg
    ctx.fill()
    ctx.strokeStyle = palette.clusterBorder
    ctx.lineWidth = 1.5
    ctx.stroke()

    const displayCount = Math.round(ac.count)
    if (displayCount > 0) {
      ctx.fillStyle = palette.clusterText
      ctx.font = DOT_FONT
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(displayCount), x, y + 0.5)
    }

    if (ac.activeCount > 0 && ac.tAlpha > 0) {
      const badgeX = x + size * 0.7
      const badgeY = y - size * 0.7
      ctx.beginPath()
      ctx.arc(badgeX, badgeY, 7, 0, TWO_PI)
      ctx.fillStyle = palette.activeBadge
      ctx.fill()
      ctx.strokeStyle = palette.clusterBorder
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.font = BADGE_FONT
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(ac.activeCount), badgeX, badgeY + 0.5)
    }

    ctx.globalAlpha = 1
  }

  function renderFrame(now: number): void {
    if (width === 0 || height === 0) return

    const t = transition
    const factor = flatScale() * DEG
    const flatCx = width / 2 + pan.x * (1 - t)
    const flatCy = height / 2 + pan.y * (1 - t)

    ctx.clearRect(0, 0, width, height)
    drawGlobeBackdrop(t)
    drawLandDots(t)

    const lambda0 = -rotation[0] * DEG
    const phi0 = -rotation[1] * DEG
    const cosPhi0 = Math.cos(phi0)
    const sinPhi0 = Math.sin(phi0)
    const globeR = globeRadius()
    const globeCx = width / 2
    const globeCy = height / 2

    // ---- Project geo-clusters into screen space ----
    const projected: Projected[] = []
    const clusterEls = getClusterEls()
    const slotMarkers = getSlotMarkers()

    for (let ci = 0; ci < geoClusters.length; ci++) {
      const gc = geoClusters[ci]!
      const cosLat = Math.cos(gc.avgLat * DEG)
      const sinLat = Math.sin(gc.avgLat * DEG)

      const fx = flatCx + factor * gc.avgLng
      const fy = flatCy - factor * gc.avgLat
      let px = fx
      let py = fy
      let visible = true

      if (t > 0.01) {
        const lambdaRel = gc.avgLng * DEG - lambda0
        const cosLambdaRel = Math.cos(lambdaRel)
        const cosC = sinPhi0 * sinLat + cosPhi0 * cosLat * cosLambdaRel
        if (cosC < 0) {
          visible = false
        } else {
          const gx = globeCx + globeR * cosLat * Math.sin(lambdaRel)
          const gy = globeCy - globeR * (cosPhi0 * sinLat - sinPhi0 * cosLat * cosLambdaRel)
          px = fx + (gx - fx) * t
          py = fy + (gy - fy) * t
        }
      }

      if (!visible || px < -30 || px > width + 30 || py < -30 || py > height + 30) {
        const el = clusterEls.get(ci)
        if (el && el.style.display !== 'none') el.style.display = 'none'
        continue
      }

      projected.push({
        px,
        py,
        markers: gc.markers,
        hasActive: gc.hasActive,
        activeCount: gc.activeCount,
        sourceIndices: [ci],
      })
    }

    animClusters = reconcileAnimClusters(mergeScreenClusters(projected))

    // ---- Paint ----
    const frameHitTargets: DottedMapHitTarget[] = []
    const usedEls = new Set<number>()

    for (const ac of animClusters) {
      if (ac.tAlpha === 0 && ac.alpha < 0.05) continue

      const soloSlotMarker =
        ac.isSolo && ac.tAlpha > 0 ? ac.markers.find((m) => slotMarkers.has(m.id)) : undefined

      if (!soloSlotMarker) {
        // Nothing for the view layer to host — paint the bubble on the canvas.
        paintClusterBubble(ac, now)
        const el = clusterEls.get(ac.sourceIndices[0]!)
        if (el && el.style.display !== 'none') el.style.display = 'none'
        if (ac.tAlpha > 0) {
          frameHitTargets.push({
            x: ac.x,
            y: ac.y,
            radius: ac.size + 4,
            markers: ac.markers,
          })
        }
        continue
      }

      // Hosted marker: the view layer owns the pixels, we only position it.
      const key = ac.sourceIndices[0]!
      const el = clusterEls.get(key)
      if (!el) {
        // Wrapper not mounted yet — fall back to a canvas bubble so nothing flickers.
        paintClusterBubble(ac, now)
        continue
      }

      usedEls.add(key)

      if (ac.hasActive) {
        const pulse = 1 + 0.3 * Math.sin((now / 600) * Math.PI)
        ctx.globalAlpha = ac.alpha
        ctx.beginPath()
        ctx.arc(ac.x, ac.y, 24 * pulse, 0, TWO_PI)
        ctx.fillStyle = palette.activeGlow
        ctx.fill()
        ctx.globalAlpha = 1
      }

      onMarkerFrame?.({
        key,
        el,
        marker: soloSlotMarker,
        x: ac.x,
        y: ac.y,
        alpha: ac.alpha,
        size: ac.size,
        tSize: ac.tSize,
        hasActive: ac.hasActive,
        time: now,
      })

      frameHitTargets.push({
        x: ac.x,
        y: ac.y,
        radius: 20,
        markers: ac.markers,
      })
    }

    // Hide wrappers we did not touch this frame.
    for (const [ci, el] of clusterEls) {
      if (!usedEls.has(ci) && el.style.display !== 'none') el.style.display = 'none'
    }

    hitTargets = frameHitTargets
  }

  function frame(now: number): void {
    if (destroyed) return
    advanceState()
    renderFrame(now)
    rafId = requestAnimationFrame(frame)
  }

  function resize(): void {
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  rebuildClusters()

  return {
    start() {
      if (destroyed || rafId) return
      resize()
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => resize())
        resizeObserver.observe(container)
      }
      rafId = requestAnimationFrame(frame)
    },

    destroy() {
      destroyed = true
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
      resizeObserver?.disconnect()
      resizeObserver = null
    },

    setActive(next) {
      if (destroyed || next === active) return
      active = next
      if (active) {
        if (!rafId) rafId = requestAnimationFrame(frame)
      } else if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    },

    setTheme(theme, isDark) {
      palette = resolveTheme(isDark, theme)
    },

    setAutoRotate(enabled) {
      // Never auto-rotate for users who asked for reduced motion.
      autoRotate = enabled && !isMotionReduced()
      if (enabled) pausedByDrag = false
    },

    setMarkers(next) {
      markers = next
      rebuildClusters()
    },

    setActiveMarkerIds(ids) {
      activeMarkerIds = ids
      rebuildClusters()
    },

    setViewMode(mode) {
      viewMode = mode
      targetTransition = mode === 'globe' ? 1 : 0
      targetZoom = 1
      velocity.x = 0
      velocity.y = 0
    },

    beginDrag() {
      dragging = true
    },

    dragBy(dx, dy) {
      if (transition > 0.5) {
        rotation[0] += dx * 0.3
        rotation[1] -= dy * 0.3
        velocity.x = dx * 0.3
        velocity.y = -dy * 0.3
        // Touching the globe stops the idle spin for the rest of the session.
        if (autoRotate) {
          autoRotate = false
          pausedByDrag = true
        }
      } else {
        pan.x += dx
        pan.y += dy
        velocity.x = dx * 0.5
        velocity.y = dy * 0.5
      }
    },

    endDrag() {
      dragging = false
    },

    zoomByFactor(factor) {
      const [min] = zoomRange
      targetZoom = Math.max(min, Math.min(maxZoom(), targetZoom * factor))
    },

    hitTest(x, y) {
      for (const hit of hitTargets) {
        const dx = x - hit.x
        const dy = y - hit.y
        if (dx * dx + dy * dy <= hit.radius * hit.radius) return hit
      }
      return undefined
    },

    getGeoClusters() {
      return geoClusters
    },

    zoomIn() {
      targetZoom = Math.min(maxZoom(), targetZoom * 1.4)
    },

    zoomOut() {
      const [min] = zoomRange
      targetZoom = Math.max(min, targetZoom / 1.4)
    },

    getZoom() {
      return zoom
    },

    resize,

    resetView() {
      rotation[0] = initialRotation[0]
      rotation[1] = initialRotation[1]
      pan.x = 0
      pan.y = 0
      velocity.x = 0
      velocity.y = 0
      zoom = initialZoom
      targetZoom = initialZoom
    },

    settle() {
      transition = targetTransition
      zoom = targetZoom
      pan.x = 0
      pan.y = 0
      velocity.x = 0
      velocity.y = 0
    },

    getViewMode() {
      return viewMode
    },
  }
}
