<script setup lang="ts">
import { useBlogTaxonomies } from '@/composables/useBlogTaxonomies'
import { tagPath } from '@/utils/taxonomy'

const { tags } = await useBlogTaxonomies()

useSeoMeta({
  title: '标签',
  description: () => `全部 ${tags.value.length} 个标签，按文章数排序。`,
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">标签</h1>

    <ul class="flex flex-wrap gap-2">
      <li v-for="tag in tags" :key="tag.name">
        <NuxtLink :to="tagPath(tag.name)" class="tag-chip">
          {{ tag.name }}
          <span class="op-60">{{ tag.count }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
