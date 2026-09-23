<script setup lang="ts">
// 列表第 2..N 页：`/blog/page/2`。
//
// 路径分页而不是 query 分页，是为了让静态站每一页都有独立的预渲染 HTML ——
// 页码链接是真实的 `<a>`，`nuxt generate` 的链接抓取会顺着它把 2..N 页都生成出来，
// 既不用客户端抛弃预渲染结果重渲，老文章也进得了 HTML。
import BlogList from '@/components/BlogList.vue'
import { useBlogPosts } from '@/composables/useBlogPosts'
import { usePagination } from '@/composables/usePagination'

const route = useRoute()
const requested = Number(route.params.page)

// `/blog/page/1` 与 `/blog` 是同一页，避免重复内容
if (requested === 1) {
  await navigateTo('/blog', { replace: true })
}

const { posts } = await useBlogPosts()
const { page, totalPages, listPaged } = usePagination(posts, { page: requested })

// 路径分页必须显式 404：否则 /blog/page/999 会渲染一个空列表还返回 200
if (!Number.isInteger(requested) || requested < 2 || requested > totalPages.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({ title: `Blog · 第 ${page.value} 页` })
</script>

<template>
  <BlogList
    :posts="listPaged"
    :page="page"
    :total-pages="totalPages"
    :title="`Blog · 第 ${page} 页`"
  />
</template>
