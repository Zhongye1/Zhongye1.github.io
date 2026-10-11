<script setup lang="ts">
export interface WidgetDlItem {
  label: string
  /** 纯文本。要图标就填下面的 icon，不必自己拼 VNode */
  value: MaybeRefOrGetter<string>
  /** 名称前的图标类名（UnoCSS），需在 uno.config.ts 的 safelist 中登记 */
  icon?: string
  /** 整行的悬浮提示 */
  tip?: MaybeRefOrGetter<string>
}

const props = withDefaults(
  defineProps<{
    items: WidgetDlItem[]
    /** small = 横向平铺等宽（名称在上），medium = 双列网格（名称右对齐） */
    size?: 'small' | 'medium'
    /** 仅 small 生效：每行固定放几项，超出换行。不填则按容器宽度自然换行 */
    columns?: number
  }>(),
  { size: 'medium' },
)

/**
 * 自然换行是按「放得下就塞」来折行的，项数一多就会出现「上长下短」（比如 5 + 3）。
 * 指定 columns 后改用固定列数的网格，行内各项依旧等宽。
 *
 * 列宽用 `minmax(min-content, 1fr)` 而不是裸 `1fr`：等分出来的格子可能比
 * 「v22.22.2」这类最长值还窄，裸 1fr 会被 nowrap 的内容顶出去（外层是 overflow-hidden，
 * 直接就被裁掉了）。以 min-content 为下限，等分只在放得下时才生效。
 */
const smallStyle = computed(() =>
  props.size === 'small' && props.columns
    ? { gridTemplateColumns: `repeat(${props.columns}, minmax(min-content, 1fr))` }
    : undefined,
)
</script>

<template>
  <dl
    :class="
      size === 'small'
        ? ['gap-x-[1em] gap-y-[0.5em] text-center', columns ? 'grid' : 'flex flex-wrap']
        : 'grid grid-cols-[auto_auto] gap-x-[8%] gap-y-[0.4em] py-[0.2em]'
    "
    :style="smallStyle"
  >
    <div
      v-for="{ label, value, icon, tip } in items"
      :key="label"
      :class="
        size === 'small'
          ? ['whitespace-nowrap py-[0.2em]', columns ? undefined : 'flex-1']
          : 'contents'
      "
    >
      <!-- medium 下 dt / dd 靠父级 display:contents 直接参与网格，名称列右对齐 -->
      <dt
        class="text-[0.9em] text-[var(--c-text-2)]"
        :class="size === 'medium' ? 'text-end' : undefined"
      >
        {{ label }}
      </dt>
      <dd :title="toValue(tip)">
        <span v-if="icon" :class="icon" class="me-1 align-middle" />
        {{ toValue(value) }}
      </dd>
    </div>
  </dl>
</template>
