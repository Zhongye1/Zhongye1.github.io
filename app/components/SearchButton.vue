<script setup lang="ts">
// 搜索入口按钮，移植自 @nuxt/ui v4 的 `DashboardSearchButton`。
//
// 照搬的是**逻辑**：同一颗按钮按 `collapsed` 决定是否包一层提示；折叠时收成方形图标按钮，
// 并把文案挪到 `aria-label` 上；未折叠时右侧挂快捷键键帽。上游的 UButton / UKbd / UTooltip
// 与主题系统换成了站点自己的 token、CSS 提示与手写键帽。
import { useSiteSearch } from '@/composables/useSiteSearch'

const props = withDefaults(
  defineProps<{
    /** 按钮文案 */
    label?: string
    /** 折叠成方形图标按钮：隐藏文案与键帽，改挂提示 + aria-label */
    collapsed?: boolean
    /** 折叠时是否显示提示（对齐上游的 `tooltip`，这里是纯 CSS 实现） */
    tooltip?: boolean
    /** 快捷键键帽，`meta` 会按平台渲染成 ⌘ / Ctrl */
    kbds?: string[]
    /** 图标类名，传 `false` 隐藏图标 */
    icon?: string | false
  }>(),
  {
    label: '搜索',
    collapsed: false,
    tooltip: true,
    kbds: () => ['meta', 'k'],
    icon: 'i-tabler-search',
  },
)

const { showSearch } = useSiteSearch()

// 平台判断放在 onMounted：SSR 一律按非 macOS 渲染，避免 hydration 时文本对不上
const isMac = ref(false)
onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.userAgent)
})

const KBD_LABELS: Record<string, string> = {
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  escape: 'Esc',
}

function kbdLabel(key: string) {
  if (key === 'meta' || key === 'command') return isMac.value ? '⌘' : 'Ctrl'
  return KBD_LABELS[key] ?? key.toUpperCase()
}
</script>

<template>
  <button
    type="button"
    data-search-trigger
    class="group relative flex items-center gap-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg-1)] text-sm text-[var(--c-text-3)] transition-colors hover:text-[var(--c-text-1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-primary)]"
    :class="props.collapsed ? 'size-9 justify-center' : 'w-full px-3 py-2'"
    :aria-label="props.collapsed ? props.label : undefined"
    @click="showSearch()"
  >
    <span v-if="props.icon !== false" :class="props.icon" class="shrink-0 text-base" />

    <span v-if="!props.collapsed" class="truncate">
      <slot>{{ props.label }}</slot>
    </span>

    <span v-if="!props.collapsed" class="ms-auto flex shrink-0 items-center gap-0.5">
      <slot name="trailing">
        <kbd
          v-for="(kbd, index) in props.kbds"
          :key="index"
          class="rounded border border-[var(--c-border)] bg-[var(--c-bg-2)] px-1 text-[0.6875rem] leading-5"
        >
          {{ kbdLabel(kbd) }}
        </kbd>
      </slot>
    </span>

    <span
      v-if="props.collapsed && props.tooltip"
      role="tooltip"
      class="pointer-events-none absolute start-full top-1/2 z-30 ms-2 -translate-y-1/2 rounded-md border border-[var(--c-border)] bg-[var(--c-bg)] px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {{ props.label }}
    </span>
  </button>
</template>
