<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useDottedMap } from '~/composables/useDottedMap'
import type {
  DottedMapMarker,
  DottedMapMarkerCluster,
  DottedMapTheme,
  DottedMapViewMode,
} from '~/utils/dotted-map/types'

const props = withDefaults(
  defineProps<{
    markers: DottedMapMarker[]
    /** Uncontrolled initial mode. */
    defaultViewMode?: DottedMapViewMode
    /** Controlled mode — pair with `@update:viewMode`. */
    viewMode?: DottedMapViewMode
    activeMarkerIds?: Set<string> | string[]
    /** Theme overrides; the rest comes from the built-in light/dark palettes. */
    theme?: DottedMapTheme
    /** `undefined` follows the `html.dark` class. */
    darkMode?: boolean
    initialRotation?: [number, number]
    initialZoom?: number
    autoRotate?: boolean
    zoomRange?: [number, number]
    clusterCellDegrees?: number
    /** Pause the render loop while off-screen or the tab is hidden. */
    pauseWhenHidden?: boolean
  }>(),
  {
    // `defaultViewMode` deliberately has no default here so an explicit value
    // from the caller is never shadowed; the composable falls back to 'flat'.
    autoRotate: true,
    pauseWhenHidden: true,
  },
)

const emit = defineEmits<{
  'update:viewMode': [mode: DottedMapViewMode]
  markerClick: [cluster: DottedMapMarkerCluster]
}>()

const slots = defineSlots<{
  /** Rendered for every solo marker; the engine positions the wrapper each frame. */
  marker?: (props: { marker: DottedMapMarker; isActive: boolean; index: number }) => unknown
  /** Free-form overlay (zoom buttons, legend…). Sits above the canvas, ignores pointer events. */
  default?: () => unknown
}>()

const {
  container,
  canvas,
  engine,
  viewMode,
  isDark,
  clusterSlots,
  setClusterEl,
  handlers,
  zoomIn,
  zoomOut,
  getZoom,
  resetView,
} = useDottedMap({
  markers: toRef(props, 'markers'),
  defaultViewMode: toRef(props, 'defaultViewMode'),
  viewMode: toRef(props, 'viewMode'),
  activeMarkerIds: toRef(props, 'activeMarkerIds'),
  theme: toRef(props, 'theme'),
  darkMode: toRef(props, 'darkMode'),
  initialRotation: () => toRef(props, 'initialRotation').value ?? [0, -20],
  initialZoom: toRef(props, 'initialZoom'),
  autoRotate: toRef(props, 'autoRotate'),
  zoomRange: toRef(props, 'zoomRange'),
  clusterCellDegrees: toRef(props, 'clusterCellDegrees'),
  pauseWhenHidden: props.pauseWhenHidden,
  hasMarkerSlot: () => Boolean(slots.marker),
  onViewModeChange: (mode) => emit('update:viewMode', mode),
  onMarkerClick: (cluster) => emit('markerClick', cluster),
})

// Slot entries only materialise once the engine exists (client-side).
// Narrow away the wrappers that stay canvas-painted, so the slot prop is never `undefined`.
const markerSlots = computed(() =>
  clusterSlots.value.filter(
    (entry): entry is typeof entry & { marker: DottedMapMarker } => entry.marker !== undefined,
  ),
)

defineExpose({
  engine,
  isDark,
  viewMode,
  zoomIn,
  zoomOut,
  getZoom,
  resetView,
  setViewMode: (mode: DottedMapViewMode) => (viewMode.value = mode),
})
</script>

<template>
  <div
    ref="container"
    class="dotted-map"
    v-on="handlers"
    :style="{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      cursor: 'grab',
      userSelect: 'none',
      // Without this, dragging the map also scrolls the page on touch devices.
      touchAction: 'none',
      WebkitTapHighlightColor: 'transparent',
    }"
  >
    <canvas ref="canvas" style="display: block; width: 100%; height: 100%"></canvas>

    <div
      v-if="$slots.marker"
      style="position: absolute; inset: 0; pointer-events: none; overflow: hidden"
    >
      <div
        v-for="entry in markerSlots"
        :key="entry.index"
        :ref="(el: Element | null) => setClusterEl(entry.index, el)"
        :style="{
          position: 'absolute',
          left: '0',
          top: '0',
          willChange: 'transform',
          // The engine flips this to '' on the first frame that hosts the marker.
          display: 'none',
        }"
      >
        <slot
          name="marker"
          :marker="entry.marker"
          :is-active="entry.isActive"
          :index="entry.index"
        />
      </div>
    </div>

    <div v-if="$slots.default" style="position: absolute; inset: 0; pointer-events: none">
      <slot />
    </div>
  </div>
</template>
