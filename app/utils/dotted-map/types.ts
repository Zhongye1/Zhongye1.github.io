/**
 * Types for the headless dotted-map engine.
 *
 * Ported from `@wescld/dotted-map` (MIT, https://github.com/wescld/dotted-map)
 * and kept framework-agnostic on purpose — nothing in here mentions Vue or React,
 * so the same contract can back a React wrapper later.
 */

export interface DottedMapMarker {
  id: string
  latitude: number
  longitude: number
  data?: Record<string, unknown>
}

export type DottedMapViewMode = 'globe' | 'flat'

export interface DottedMapTheme {
  dotColor?: string
  globeFill?: string
  outlineColor?: string
  clusterColor?: string
  clusterTextColor?: string
  clusterBorderColor?: string
  activeGlow?: string
  activeBadgeColor?: string
}

/** Fully resolved palette handed to the render loop every frame. */
export interface DottedMapPalette {
  dotColor: string
  globeFill: string
  outlineColor: string
  clusterBg: string
  clusterText: string
  clusterBorder: string
  activeGlow: string
  activeBadge: string
}

export interface DottedMapMarkerCluster {
  markers: DottedMapMarker[]
  x: number
  y: number
  radius: number
}

/** A cluster under the pointer: screen position plus the markers it contains. */
export interface DottedMapHitTarget extends DottedMapMarkerCluster {}

/** A geospatial cluster (geo-grid phase), mirrored to the view layer as a slot host. */
export interface DottedMapGeoCluster {
  avgLng: number
  avgLat: number
  count: number
  markers: DottedMapMarker[]
  hasActive: boolean
  activeCount: number
}

/** Animated cluster (screen-space phase). Lives only inside the render loop. */
export interface DottedMapAnimCluster {
  x: number
  y: number
  tx: number
  ty: number
  size: number
  tSize: number
  count: number
  tCount: number
  alpha: number
  tAlpha: number
  markers: DottedMapMarker[]
  hasActive: boolean
  activeCount: number
  sourceIndices: number[]
  isSolo: boolean
}

/** One live marker wrapper in the view layer, keyed by its geo-cluster index. */
export interface DottedMapMarkerSlot<T = unknown> {
  /** Index into the geo-cluster array — stable while `markers` is unchanged. */
  key: number
  /**
   * Set when this wrapper hosts slot content (a solo marker the consumer renders
   * itself). When `undefined` the wrapper stays hidden and the bubble is painted
   * on the canvas instead.
   */
  marker?: T
  isActive: boolean
}

/** Per-frame update pushed to the view layer; never routed through reactivity. */
export interface DottedMapMarkerFrame {
  key: number
  el: HTMLElement
  /** Solo marker the consumer rendered into this wrapper. */
  marker: DottedMapMarker
  x: number
  y: number
  alpha: number
  size: number
  tSize: number
  hasActive: boolean
  time: number
}
