<script setup lang="ts">
// 列表第 1 页。第 2 页起在 `blog/page/[page].vue`，两页共用 `BlogList`。
import BlogList from '@/components/BlogList.vue'
import { useBlogPosts } from '@/composables/useBlogPosts'
import { usePagination } from '@/composables/usePagination'

const { posts } = await useBlogPosts()
const { totalPages, listPaged } = usePagination(posts, { page: 1 })

useSeoMeta({ title: 'Blog' })
</script>

<template>
  <BlogList :posts="listPaged" :page="1" :total-pages="totalPages" />
</template>
