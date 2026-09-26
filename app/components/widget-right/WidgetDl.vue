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

withDefaults(
  defineProps<{
    items: WidgetDlItem[]
    /** small = 横向平铺等宽（名称在上），medium = 双列网格（名称右对齐） */
    size?: 'small' | 'medium'
  }>(),
  { size: 'medium' },
)
</script>

<template>
  <dl
    :class="
      size === 'small'
        ? 'flex flex-wrap gap-x-[1em] gap-y-[0.5em] text-center'
        : 'grid grid-cols-[auto_auto] gap-x-[8%] gap-y-[0.4em] py-[0.2em]'
    "
  >
    <div
      v-for="{ label, value, icon, tip } in items"
      :key="label"
      :class="size === 'small' ? 'flex-1 whitespace-nowrap py-[0.2em]' : 'contents'"
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
