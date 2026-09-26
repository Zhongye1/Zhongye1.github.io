<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

/**
 * 目录的无样式结构层：只渲染 `ul` / `li` 和 `data-*` 标记，视觉全部交给使用方。
 * 递归顺序与 `flattenToc` 的深度优先顺序一致 —— 指示线下标、自动居中都依赖这个前提。
 */
defineOptions({ name: 'TocTree' })

withDefaults(
  defineProps<{
    links: TocLink[]
    level?: number
    /** 每个 ul 的类名，按层级给 */
    listClass?: (level: number) => string | undefined
    /** 每个 li 的类名 */
    itemClass?: (link: TocLink, level: number) => string | undefined
  }>(),
  { level: 0 },
)

// 显式声明插槽类型：递归引用自己时，靠它打断「插槽类型依赖自身」的推断环
defineSlots<{
  /** 单条链接的渲染位，`level` 从 0 开始 */
  default?(props: { link: TocLink; level: number }): any
}>()
</script>

<template>
  <ul :data-toc-list="level" :class="listClass?.(level)">
    <li
      v-for="link in links"
      :key="link.id"
      :data-toc-item="link.id"
      :data-has-children="link.children?.length ? '' : undefined"
      :class="itemClass?.(link, level)"
    >
      <slot :link="link" :level="level" />

      <TocTree
        v-if="link.children?.length"
        :links="link.children"
        :level="level + 1"
        :list-class="listClass"
        :item-class="itemClass"
      >
        <template #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </TocTree>
    </li>
  </ul>
</template>
