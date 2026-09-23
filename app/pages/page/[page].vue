<script setup lang="ts">
// 首页文章列表的第 2..N 页：`/page/2`。
//
// 路径分页而不是 query 分页，是为了让静态站每一页都有独立的预渲染 HTML ——
// 页码链接是真实的 `<a>`，`nuxt generate` 的链接抓取会顺着它把 2..N 页都生成出来，
// 既不用客户端抛弃预渲染结果重渲，老文章也进得了 HTML。
import { useBlogPosts } from '@/composables/useBlogPosts'

const route = useRoute()
const requested = Number(route.params.page)

// `/page/1` 与 `/` 是同一页，避免重复内容
if (requested === 1) {
  await navigateTo('/', { replace: true })
}

const { posts } = await useBlogPosts()
const { page, totalPages } = usePagination(posts, { page: requested })

// 路径分页必须显式 404：否则 /page/999 会渲染一个空列表还返回 200
if (!Number.isInteger(requested) || requested < 2 || requested > totalPages.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({ title: `文章 · 第 ${page.value} 页` })
</script>

<template>
  <PostListPage :posts="posts" :page="page" base="" :title="`文章 · 第 ${page} 页`" />
</template>
