<script setup lang="ts">
// 关于页。正文不在组件里，取自 `content/spec/about.md`（content.config.ts 里的 `pages` 集合，
// 集合路径是 `/spec/about`）；页面路由仍留在 `/about`，不给同一份内容再开一条 `/spec/about`。
const { data: page } = await useAsyncData('about-page', () =>
  queryCollection('pages').path('/spec/about').first(),
)

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    message: 'No content found for /spec/about',
    fatal: true,
  })
}

// 标题与描述优先用 md 里抽出来的，缺了就退回原来写死的文案，
// 免得再出现「/about - Zhongye」这种把路径当标题的结果
useSeoMeta({
  title: page.value.title || '关于',
  description: page.value.description || '关于本站与作者 Zhongye。',
})

// 正文的标题树交给 layout 的右栏目录（和文章页同一套）
const { setPageToc } = usePageToc()
setPageToc(page.value.body?.toc?.links)
</script>

<template>
  <!-- v-if 只为类型收窄：上面的 404 已经兜住了空数据 -->
  <div v-if="page" class="flex flex-col gap-8">
    <article class="post-body">
      <ContentRenderer :value="page" />
    </article>

    <!-- 评论是真·客户端功能（要等脚本 + 请求后端），静态站预渲染时只有占位文案 -->
    <ClientOnly>
      <Comment />
    </ClientOnly>
  </div>
</template>
