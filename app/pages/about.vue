<script setup lang="ts">
// TODO: 页面内容还是脚手架占位（content/spec/about.md 目前没有路由消费它），
// 这里先补上标题与描述，至少不出现「/about - Zhongye」这种把路径当标题的结果
useSeoMeta({
  title: '关于',
  description: '关于本站与作者 Zhongye。',
})
</script>

<template>
  <section>
    <p>This page will be displayed at the /about route.</p>
  </section>
</template>
