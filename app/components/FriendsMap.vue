<script setup lang="ts">
// 友链页上的点阵地图
//
// 数据来自 `worker/` 里那个 Cloudflare Worker 的 `/api/map`，取数与降级逻辑
// 全在 `useVisitorMap`；标记的权重语义见 `utils/dotted-map/types.ts` 的 `weight`。
import { visitorApi } from '@/site.config'
import type { DottedMapMarker, DottedMapViewMode } from '~/utils/dotted-map/types'

const { days, markers, totals, pending, failed } = useVisitorMap()

const mapRef = useTemplateRef('map')
const viewMode = ref<DottedMapViewMode>('globe')
const expanded = ref(true)
/** 被点中的气泡，用来在标题栏展开详情并高亮 */
const active = ref<DottedMapMarker[]>([])

/** 点中的可能是聚合气泡（好几个城市），所以标题栏得能列出一串 */
const activeLabels = computed(() =>
  active.value
    .map((place) => {
      const name = place.data?.name
      if (typeof name !== 'string') return ''
      const visits = Number(place.data?.visits ?? 0)
      return visits > 1 ? `${name} · ${visits}` : name
    })
    .filter(Boolean),
)

/** 没有选中任何点时，标题栏显示的概要 */
const summary = computed(() => {
  if (failed.value) return '访客数据暂时不可用'
  const total = totals.value
  if (!total) return pending.value ? '加载中…' : '还没有访客记录'
  if (total.visits === 0) return '还没有访客记录'
  return `${total.cities} 个城市 · ${total.visits} 次访问`
})

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
      <!-- 卡片自己的标题，收起时也留着；右边紧跟动态概要 -->
      <h2 class="map-title">
        <span class="i-tabler-map-pin text-[var(--c-primary)]" />
        <span>访客地图</span>
      </h2>

      <span class="map-summary">
        {{ activeLabels.length ? activeLabels.join(' · ') : summary }}
      </span>

      <!-- 时间窗。切换会重新拉一次 /api/map，服务端按 UTC+8 切日 -->
      <div class="map-mode" role="group" aria-label="时间范围">
        <button
          v-for="option in visitorApi.ranges"
          :key="option.value"
          type="button"
          class="map-mode-btn"
          :class="{ 'is-on': days === option.value }"
          :disabled="!expanded"
          :aria-pressed="days === option.value"
          @click="days = option.value"
        >
          {{ option.label }}
        </button>
      </div>

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
          <!--
            刻意不传 #marker slot：所有城市点都由 canvas 画成气泡、圆里写访问次数
            （weight 1 也写「1」），这样图上只有一种点的画法。
            点一下仍然有效——城市名与次数会出现在上面的标题栏里，
            配色统一在 `utils/dotted-map/theme.ts` 的调色板里（全图一个主色）。
          -->
          <DottedMap
            ref="map"
            v-model:view-mode="viewMode"
            :markers="markers"
            :active-marker-ids="active.map((place) => place.id)"
            :auto-rotate="true"
            @marker-click="active = $event.markers"
          />
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
  // 两个分段控件 + 四个图标按钮在窄屏放不下一行，允许换行而不是把标题挤没
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.5rem;
  padding: 0.5rem 0.8rem;
  font-size: 0.8em;
  color: var(--c-text-2);
}

.map-title {
  display: flex;
  // 标题是固定文案，窄屏优先压缩右边的概要，而不是把它挤换行
  flex-shrink: 0;
  align-items: center;
  gap: 0.35em;
  color: var(--c-text-1);
  font-weight: 600;
}

// 标题旁的动态概要：点中城市时整串换成城市名，所以照样要能截断
.map-summary {
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// 3D / 2D 与时间窗共用的分段控件：选中态用主色柔光底，避免和右侧的图标按钮混淆
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

@media (prefers-reduced-motion: reduce) {
  .map-collapse {
    transition: none;
  }
}
</style>
