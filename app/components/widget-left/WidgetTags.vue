<script setup lang="ts">
import { useBlogTaxonomies } from '@/composables/useBlogTaxonomies'
import { tagPath } from '@/utils/taxonomy'

/** 左栏只放最常用的十几个，长尾靠「全部标签」兜住 */
const TOP_LIMIT = 15

const { tags } = await useBlogTaxonomies()
const topTags = computed(() => tags.value.slice(0, TOP_LIMIT))
</script>

<template>
  <WidgetCard card title="标签">
    <ul class="flex flex-wrap gap-1.5">
      <li v-for="tag in topTags" :key="tag.name">
        <NuxtLink :to="tagPath(tag.name)" class="tag-chip">
          {{ tag.name }}
          <span class="op-60">{{ tag.count }}</span>
        </NuxtLink>
      </li>
    </ul>

    <NuxtLink
      v-if="tags.length > TOP_LIMIT"
      to="/tags"
      class="mt-2 block text-center text-[0.9em] text-[var(--c-text-3)] transition-colors hover:text-[var(--c-primary)]"
    >
      全部标签（{{ tags.length }}）
    </NuxtLink>
  </WidgetCard>
</template>
