<script setup lang="ts">
// 归档：按年分组的标题列表（见 ArchiveList）。整页一次渲染完，不分页 ——
// 归档的价值就在「一屏扫完这些年」，切开反而看不出跨年的密度变化。
import ArchiveList from '@/components/ArchiveList.vue'
import { useBlogPosts } from '@/composables/useBlogPosts'

const { posts } = await useBlogPosts()

useSeoMeta({
  title: '归档',
  description: '全部文章按年份归档',
})
</script>

<template>
  <section class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">归档</h1>

    <ArchiveList :posts="posts" />
  </section>
</template>
