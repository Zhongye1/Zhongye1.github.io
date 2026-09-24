import { computed, onBeforeUnmount, onMounted, ref, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import {
  useDocumentVisibility,
  useElementVisibility,
  useMediaQuery,
  useMutationObserver,
} from '@vueuse/core'
import { createDottedMapEngine, type DottedMapEngine } from '~/utils/dotted-map/engine'
import { applyMarkerFrame } from '~/utils/dotted-map/marker-frame'
import { REDUCED_MOTION_QUERY } from '~/utils/dotted-map/motion'
import { createDottedMapPointer, type DottedMapPointerHandle } from '~/utils/dotted-map/pointer'
import type {
  DottedMapGeoCluster,
  DottedMapMarker,
  DottedMapMarkerCluster,
  DottedMapTheme,
  DottedMapViewMode,
} from '~/utils/dotted-map/types'

export interface UseDottedMapOptions {
  markers: MaybeRefOrGetter<DottedMapMarker[]>
  /** Uncontrolled initial mode. Ignored once `viewMode` is supplied. */
  defaultViewMode?: MaybeRefOrGetter<DottedMapViewMode | undefined>
  /** Controlled mode — when set, the composable stops driving the mode itself. */
  viewMode?: MaybeRefOrGetter<DottedMapViewMode | undefined>
  activeMarkerIds?: MaybeRefOrGetter<Set<string> | string[] | undefined>
  theme?: MaybeRefOrGetter<DottedMapTheme | undefined>
  /** `undefined` = follow the `html.dark` class. */
  darkMode?: MaybeRefOrGetter<boolean | undefined>
  initialRotation?: MaybeRefOrGetter<[number, number]>
  initialZoom?: MaybeRefOrGetter<number | undefined>
  autoRotate?: MaybeRefOrGetter<boolean | undefined>
  zoomRange?: MaybeRefOrGetter<[number, number] | undefined>
  clusterCellDegrees?: MaybeRefOrGetter<number | undefined>
  /** Pause the render loop while off-screen or while the tab is hidden. Default `true`. */
  pauseWhenHidden?: boolean
  /** Host markers in a `#marker` slot instead of painting them on the canvas. */
  hasMarkerSlot?: MaybeRefOrGetter<boolean>
  onViewModeChange?: (mode: DottedMapViewMode) => void
  onMarkerClick?: (cluster: DottedMapMarkerCluster) => void
}

export interface DottedMapMarkerSlotEntry<T = DottedMapMarker> {
  index: number
  marker?: T
  isActive: boolean
}

export function useDottedMap<T = DottedMapMarker>(options: UseDottedMapOptions) {
  const container = shallowRef<HTMLElement | null>(null)
  const canvas = shallowRef<HTMLCanvasElement | null>(null)

  // 直接跟随 <html> 上的 dark 类，免得和导航栏的主题状态各存一份（同 Mermaid.vue）
  const isDark = ref(false)
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY)
  const documentVisible = useDocumentVisibility()
  const inViewport = useElementVisibility(container)
  const pauseWhenHidden = options.pauseWhenHidden ?? true

  // ---- Reactive inputs, mirrored into plain values the engine reads ----
  const markerList = computed(() => toValue(options.markers) ?? [])
  const activeSet = computed<Set<string>>(() => {
    const ids = toValue(options.activeMarkerIds)
    if (!ids) return new Set()
    return ids instanceof Set ? ids : new Set(ids)
  })
  /** Cheap identity for the active set, so we only re-cluster on real changes. */
  const activeSignature = computed(() => [...activeSet.value].toSorted().join('\u0000'))

  const controlled = computed(() => toValue(options.viewMode))
  const isControlled = computed(() => controlled.value !== undefined)
  const viewMode = ref<DottedMapViewMode>(
    controlled.value ?? toValue(options.defaultViewMode) ?? 'flat',
  )
  const cellDegrees = ref<number>(toValue(options.clusterCellDegrees) ?? 15)

  const themeOption = computed(() => toValue(options.theme))
  const darkModeOption = computed(() => toValue(options.darkMode))
  const solvedDark = computed(() => darkModeOption.value ?? isDark.value)
  const autoRotateOption = computed(() => toValue(options.autoRotate) ?? true)
  const zoomRange = computed<[number, number]>(() => toValue(options.zoomRange) ?? [0.5, 6])
  const initialRotation = computed<[number, number]>(
    () => toValue(options.initialRotation) ?? [0, -20],
  )
  const initialZoom = computed(() => toValue(options.initialZoom) ?? 1)
  const hasMarkerSlot = computed(() => Boolean(toValue(options.hasMarkerSlot)))

  /**
   * Bumped whenever the engine swaps its geo-cluster array. The array itself is
   * plain (non-reactive) on purpose: it is rebuilt inside the rAF loop as zoom
   * changes, and making it reactive would re-render the component every frame.
   */
  const clusterRevision = ref(0)

  const engine = shallowRef<DottedMapEngine | null>(null)
  const clusterEls = new Map<number, HTMLElement>()
  /** Marker IDs the view layer can actually host, guarded by `hasMarkerSlot`. */
  const slotMarkers = computed<Set<string>>(() =>
    hasMarkerSlot.value ? new Set(markerList.value.map((m) => m.id)) : new Set(),
  )

  let pointer: DottedMapPointerHandle | null = null
  let stopDarkObserver: ReturnType<typeof useMutationObserver> | null = null

  // ---- Marker wrappers (plain Map, never a ref: mutated every frame) ----
  function setClusterEl(index: number, el: Element | null) {
    if (el instanceof HTMLElement) clusterEls.set(index, el)
    else clusterEls.delete(index)
  }

  function ensureEngine(): DottedMapEngine | null {
    if (engine.value) return engine.value
    const containerEl = container.value
    const canvasEl = canvas.value
    if (!containerEl || !canvasEl) return null

    const instance = createDottedMapEngine({
      container: containerEl,
      canvas: canvasEl,
      markers: markerList.value,
      activeMarkerIds: activeSet.value,
      viewMode: viewMode.value,
      theme: themeOption.value,
      initialRotation: initialRotation.value,
      initialZoom: initialZoom.value,
      autoRotate: autoRotateOption.value,
      zoomRange: zoomRange.value,
      clusterCellDegrees: toValue(options.clusterCellDegrees),
      getSlotMarkers: () => slotMarkers.value,
      getClusterEls: () => clusterEls,
      onMarkerFrame: applyMarkerFrame,
      onMarkerClick: options.onMarkerClick,
      onCellDegreesChange: (next) => {
        cellDegrees.value = next
        clusterRevision.value++
      },
    })

    instance.setTheme(themeOption.value, solvedDark.value)
    instance.setAutoRotate(autoRotateOption.value && !reducedMotion.value)
    instance.start()

    pointer = createDottedMapPointer({
      engine: instance,
      container: containerEl,
      onMarkerClick: options.onMarkerClick,
    })

    engine.value = instance
    clusterRevision.value++
    return instance
  }

  // ---- Keep the engine in sync with reactive input ----

  watch([markerList, () => toValue(options.clusterCellDegrees)], () => {
    const instance = engine.value
    if (!instance) return
    instance.setMarkers(markerList.value)
    clusterRevision.value++
  })

  watch(activeSignature, () => {
    const instance = engine.value
    if (!instance) return
    instance.setActiveMarkerIds(activeSet.value)
    clusterRevision.value++
  })

  watch([themeOption, solvedDark], ([theme, dark]) => {
    engine.value?.setTheme(theme, dark)
  })

  watch(autoRotateOption, (enabled) => {
    engine.value?.setAutoRotate(enabled && !reducedMotion.value)
  })

  watch(reducedMotion, (reduced) => {
    engine.value?.setAutoRotate(autoRotateOption.value && !reduced)
  })

  // Controlled mode: the parent owns the value, we only follow it.
  watch(controlled, (mode) => {
    if (mode === undefined) return
    viewMode.value = mode
  })
  watch(viewMode, (mode) => {
    engine.value?.setViewMode(mode)
  })

  if (pauseWhenHidden) {
    watch(
      [documentVisible, inViewport],
      ([visible, inView]) => {
        engine.value?.setActive(visible === 'visible' && inView)
      },
      { immediate: false },
    )
  }

  onMounted(() => {
    if (import.meta.server) return

    const root = document.documentElement
    const syncDark = () => (isDark.value = root.classList.contains('dark'))
    syncDark()
    stopDarkObserver = useMutationObserver(root, syncDark, {
      attributes: true,
      attributeFilter: ['class'],
    })

    ensureEngine()
    // `{ passive: false }` is required for preventDefault() to stop page scroll.
    canvas.value?.addEventListener('wheel', handleWheel, { passive: false })
  })

  function handleWheel(event: WheelEvent) {
    pointer?.onWheel(event)
  }

  onBeforeUnmount(() => {
    stopDarkObserver?.stop()
    canvas.value?.removeEventListener('wheel', handleWheel)
    engine.value?.destroy()
    engine.value = null
    pointer = null
    clusterEls.clear()
  })

  // ---- Public surface ----

  /** One entry per geo-cluster: the view layer renders a wrapper element for each. */
  const clusterSlots = computed<DottedMapMarkerSlotEntry<T>[]>(() => {
    void clusterRevision.value
    void activeSignature.value
    const clusters: DottedMapGeoCluster[] = engine.value?.getGeoClusters() ?? []
    const hostable = slotMarkers.value
    return clusters.map((cluster, index) => {
      const solo =
        cluster.markers.length === 1 && cluster.weight === 1 ? cluster.markers[0] : undefined
      const host = solo && hostable.has(solo.id) ? solo : undefined
      return {
        index,
        marker: host as unknown as T | undefined,
        isActive: Boolean(host) && activeSet.value.has(host!.id),
      }
    })
  })

  const clusterCount = computed(() => {
    void clusterRevision.value
    return engine.value?.getGeoClusters().length ?? 0
  })

  /**
   * Event handlers for `v-on`. Plain properties, no reactivity: the pointer
   * controller owns all drag state and never touches a ref.
   */
  const handlers = {
    pointerdown: (event: PointerEvent) => pointer?.onPointerDown(event),
    pointermove: (event: PointerEvent) => pointer?.onPointerMove(event),
    pointerup: (event: PointerEvent) => pointer?.onPointerUp(event),
    pointerleave: (event: PointerEvent) => pointer?.onPointerLeave(event),
    click: (event: MouseEvent) => pointer?.onClick(event),
  }

  function setViewMode(mode: DottedMapViewMode) {
    if (viewMode.value === mode) return
    if (!isControlled.value) viewMode.value = mode
    options.onViewModeChange?.(mode)
  }

  return {
    container,
    canvas,
    engine: engine as Readonly<ShallowRef<DottedMapEngine | null>>,
    /** Writable: assign to switch modes. Honours controlled mode. */
    viewMode: computed({
      get: () => viewMode.value,
      set: setViewMode,
    }),
    setViewMode,
    isDark: solvedDark,
    clusterSlots,
    clusterCount,
    setClusterEl,
    handlers,
    zoomIn: () => engine.value?.zoomIn(),
    zoomOut: () => engine.value?.zoomOut(),
    getZoom: () => engine.value?.getZoom() ?? 1,
    resetView: () => engine.value?.resetView(),
  }
}
