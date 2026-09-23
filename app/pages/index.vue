<script setup lang="ts">
// 首页 = 文章列表第 1 页；第 2 页起在 `app/pages/page/[page].vue`。
import siteConfig from '@/site.config'
import { useBlogPosts } from '@/composables/useBlogPosts'

const { posts } = await useBlogPosts()

// 首页标题就是站点名：titleTemplate 见到 chunk 与站点同名时不会再拼后缀，
// 所以这里直接给 siteConfig.title 即可
useSeoMeta({
  title: siteConfig.title,
  description: siteConfig.description,
})
</script>

<template>
  <PostListPage :posts="posts" />
</template>
