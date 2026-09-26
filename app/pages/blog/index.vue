<script setup lang="ts">
// 老路径兜底：文章列表以前在 `/blog`，现在搬到了首页。

definePageMeta({
  redirect: { path: '/' },
})
</script>

<template>
  <p>文章列表已迁移到首页，正在跳转…</p>
</template>
