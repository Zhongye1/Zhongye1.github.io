<script setup lang="ts">
// 友链页上的点阵地图：把「朋友们的坐标」画成会转的地球 / 平面地图。
//
// 楼下 `places` 是演示数据（城市）。想换成真实站点，把 latitude/longitude 填成
// 对应位置即可，`data` 里放什么就能在 slot 里画什么。
import type { DottedMapMarker, DottedMapViewMode } from '~/utils/dotted-map/types'

const places: DottedMapMarker[] = [
  { id: 'sf', latitude: 37.77, longitude: -122.42, data: { name: 'San Francisco' } },
  { id: 'ny', latitude: 40.71, longitude: -74.01, data: { name: 'New York' } },
  { id: 'sp', latitude: -23.55, longitude: -46.63, data: { name: 'São Paulo' } },
  { id: 'ld', latitude: 51.51, longitude: -0.13, data: { name: 'London' } },
  { id: 'pa', latitude: 48.86, longitude: 2.35, data: { name: 'Paris' } },
  { id: 'ca', latitude: 30.04, longitude: 31.24, data: { name: 'Cairo' } },
  { id: 'mb', latitude: -1.29, longitude: 36.82, data: { name: 'Nairobi' } },
  { id: 'sh', latitude: 31.23, longitude: 121.47, data: { name: 'Shanghai' } },
  { id: 'tk', latitude: 35.68, longitude: 139.69, data: { name: 'Tokyo' } },
  { id: 'sg', latitude: 1.35, longitude: 103.82, data: { name: 'Singapore' } },
  { id: 'sy', latitude: -33.87, longitude: 151.21, data: { name: 'Sydney' } },
]

const mapRef = useTemplateRef('map')
const viewMode = ref<DottedMapViewMode>('globe')
const expanded = ref(true)
/** 被点中的城市，用来在标题栏显示名字并高亮那个点 */
const active = ref<DottedMapMarker[]>([])

const activeNames = computed(() =>
  active.value.map((place) => place.data?.name).filter((name): name is string => Boolean(name)),
)

const modeOptions: { value: DottedMapViewMode; label: string }[] = [
  { value: 'globe', label: '3D' },
  { value: 'flat', label: '2D' },
]

function resetView() {
  mapRef.value?.resetView()
  active.value = []
}

function toggleExpanded() {
  expanded.value = !expanded.value
  // 收起来后没必要留着选中态——标题栏是唯一显示它的地方
  if (!expanded.value) active.value = []
}
</script>

<template>
  <div class="friend-map">
    <div class="map-bar">
      <span class="map-title">
        <span class="i-tabler-map-pin text-[var(--c-primary)]" />
        <span class="map-title-text">
          {{ activeNames.length ? activeNames.join(' · ') : `${places.length} 个坐标` }}
        </span>
      </span>

      <!-- 3D / 2D：地球用正交投影假装球体，2D 是等距圆柱投影 -->
      <div class="map-mode" role="group" aria-label="地图投影方式">
        <button
          v-for="option in modeOptions"
          :key="option.value"
          type="button"
          class="map-mode-btn"
          :class="{ 'is-on': viewMode === option.value }"
          :disabled="!expanded"
          :aria-pressed="viewMode === option.value"
          @click="viewMode = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <span class="map-actions">
        <button
          type="button"
          class="map-btn"
          :disabled="!expanded"
          aria-label="放大"
          @click="mapRef?.zoomIn()"
        >
          <span class="i-tabler-plus text-base" />
        </button>
        <button
          type="button"
          class="map-btn"
          :disabled="!expanded"
          aria-label="缩小"
          @click="mapRef?.zoomOut()"
        >
          <span class="i-tabler-minus text-base" />
        </button>
        <button
          type="button"
          class="map-btn"
          :disabled="!expanded"
          aria-label="回到初始视角"
          @click="resetView"
        >
          <span class="i-tabler-focus-2 text-base" />
        </button>
        <button
          type="button"
          class="map-btn map-toggle"
          :aria-expanded="expanded"
          :aria-label="expanded ? '收起地图' : '展开地图'"
          @click="toggleExpanded"
        >
          <span
            class="i-tabler-chevrons-down transition-transform duration-200 motion-reduce:transition-none"
            :class="expanded ? undefined : 'rotate-180'"
          />
        </button>
      </span>
    </div>

    <!--
      grid-template-rows 0fr→1fr 是这套代码里既有做法（见 WidgetExpand.vue）：
      高度能过渡，又不靠写死的 max-height 猜数。收起时整块 v-if 掉，
      canvas 卸载后渲染循环随之销毁，不会在后台空转。
    -->
    <div class="map-collapse" :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
      <div class="map-slot">
        <div v-if="expanded" class="map-stage">
          <DottedMap
            ref="map"
            v-model:view-mode="viewMode"
            :markers="places"
            :active-marker-ids="active.map((place) => place.id)"
            :auto-rotate="true"
            @marker-click="active = $event.markers"
          >
            <template #marker="{ marker, isActive }">
              <span class="map-dot" :class="{ 'is-active': isActive }">
                {{ (marker.data?.name as string)?.[0] }}
              </span>
            </template>
          </DottedMap>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.friend-map {
  overflow: hidden;
  border-radius: 1rem;
  background-color: var(--ld-bg-card);
}

.map-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  font-size: 0.8em;
  color: var(--c-text-2);
}

.map-title {
  display: flex;
  align-items: center;
  gap: 0.35em;
  min-width: 0;
}

.map-title-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// 3D / 2D 分段控件：选中态用主色柔光底，避免和右侧的图标按钮混淆
.map-mode {
  display: flex;
  flex-shrink: 0;
  gap: 0.1rem;
  padding: 0.1rem;
  border-radius: 0.55rem;
  background-color: var(--c-bg-2);
}

.map-mode-btn {
  padding: 0.1rem 0.5rem;
  border-radius: 0.45rem;
  color: var(--c-text-3);
  font-size: 0.9em;
  font-weight: 600;
  line-height: 1.6;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover:not(:disabled):not(.is-on) {
    color: var(--c-text-1);
  }

  &.is-on {
    background-color: var(--c-primary-soft);
    color: var(--c-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.map-actions {
  display: flex;
  gap: 0.15rem;
  margin-inline-start: auto;
}

.map-btn {
  padding: 0.3em;
  border-radius: 0.4em;
  color: var(--c-text-2);
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--c-bg-2);
    color: var(--c-primary);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
}

.map-toggle {
  margin-inline-start: 0.35rem;
}

.map-collapse {
  display: grid;
  transition: grid-template-rows 0.25s ease-out;
}

.map-slot {
  overflow: hidden;
}

// 高度必须有确定值：canvas 靠容器尺寸撑开，父级若由内容决定高度就会塌成 0
.map-stage {
  height: clamp(16rem, 42vw, 26rem);
}

.map-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  background-color: var(--c-primary);
  box-shadow: 0 0 0 2px var(--ld-bg-card);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
}

.map-dot.is-active {
  background-color: var(--c-success, #22c55e);
}

@media (prefers-reduced-motion: reduce) {
  .map-collapse {
    transition: none;
  }
}
</style>
