<script setup lang="ts">
// 首页 = 文章列表第 1 页；第 2 页起在 `app/pages/page/[page].vue`。
import siteConfig from '@/site.config'
import { useBlogPosts } from '@/composables/useBlogPosts'

const { posts } = await useBlogPosts()

// 首页不设 title：让 app.global.ts 里 `titleTemplate` 的兜底分支（`{站点名} - site`）生效。
// 若在这里写 title: siteConfig.title，模板会把它当子标题再拼一次，变成「Zhongye - Zhongye」
useSeoMeta({
  description: siteConfig.description,
})
</script>

<template>
  <PostListPage :posts="posts" />
</template>
