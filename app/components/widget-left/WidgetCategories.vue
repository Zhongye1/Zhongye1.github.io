<script setup lang="ts">
import { useBlogTaxonomies } from '@/composables/useBlogTaxonomies'
import { categoryPath } from '@/utils/taxonomy'

const { categories } = await useBlogTaxonomies()
</script>

<template>
  <WidgetCard card title="分类">
    <ul>
      <li v-for="item in categories" :key="item.name">
        <NuxtLink :to="categoryPath(item.name)" class="term">
          <span class="i-tabler-folder term-icon" />
          <span class="truncate">{{ item.name }}</span>
          <span class="term-count">{{ item.count }}</span>
        </NuxtLink>
      </li>
    </ul>
  </WidgetCard>
</template>

<style scoped>
.term {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.25em 0.5em;
  border-radius: 0.4em;
  color: var(--c-text-2);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.term:hover {
  background-color: var(--c-bg-soft);
  color: var(--c-text-1);
}

.term-icon {
  flex-shrink: 0;
  font-size: 1.1em;
  opacity: 0.6;
}

/* 篇数推到行尾，数字列对齐 */
.term-count {
  margin-inline-start: auto;
  color: var(--c-text-3);
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
}
</style>
