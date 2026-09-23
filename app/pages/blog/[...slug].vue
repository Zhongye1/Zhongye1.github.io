<script setup lang="ts">
import { coverList } from '@/site.config'

const route = useRoute()

const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param.join('/') : (param ?? '')
})

// `content/posts/2025/foo.md` is stored as `/posts/2025/foo` and served at `/blog/2025/foo`.
const contentPath = computed(() => `/posts/${slug.value}`)

const { data: post } = await useAsyncData(
  () => `post-${slug.value}`,
  () => queryCollection('posts').path(contentPath.value).first(),
  { watch: [contentPath] },
)

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
    message: `No content found for ${contentPath.value}`,
    fatal: true,
  })
}

// 分享卡用文章封面；没写 cover 的就走全局兜底图池，保证 og:image 不会缺席
const cover = computed(() => post.value?.cover || pickCover(post.value?.path ?? '', coverList))

// frontmatter 是 `2026-01-17 22:53:01`，结构化数据和 og 都要求 ISO 8601
const publishedAt = computed(() => postDate(post.value ?? {}).replace(' ', 'T'))
const updatedAt = computed(() => (post.value?.updated ?? '').replace(' ', 'T') || publishedAt.value)

useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.description,
  ogType: 'article',
  ogImage: () => cover.value,
  articlePublishedTime: () => publishedAt.value || undefined,
  articleModifiedTime: () => updatedAt.value || undefined,
  articleSection: () => post.value?.category,
  articleTag: () => post.value?.tags,
})

// 结构化数据：Article 给搜索引擎认正文，Breadcrumb 让结果里显示层级。
// 注意 articleSection 在 schema.org 类型里是「字符串数组」，传裸字符串过不了 typecheck。
useSchemaOrg([
  defineArticle({
    headline: post.value?.title ?? '',
    description: post.value?.description,
    image: cover.value,
    datePublished: publishedAt.value || undefined,
    dateModified: updatedAt.value || undefined,
    articleSection: post.value?.category ? [post.value.category] : undefined,
    keywords: post.value?.tags,
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: '首页', item: '/' },
      { name: post.value?.title ?? '', item: toBlogPath(post.value?.path ?? '') },
    ],
  }),
])

// 右侧栏的目录由 layout 渲染，这里把当前文章的标题树交出去
const { setPageToc } = usePageToc()
setPageToc(post.value?.body?.toc?.links)
</script>

<template>
  <article v-if="post" class="flex flex-col gap-8">
    <header class="flex flex-col gap-2">
      <h1 class="content-heading text-3xl font-bold">{{ post.title }}</h1>
      <p v-if="post.description" class="color-fade text-sm">{{ post.description }}</p>
      <div class="color-fade flex flex-wrap items-center gap-x-3 text-xs">
        <time v-if="formatPostDate(post)">{{ formatPostDate(post) }}</time>
        <span v-if="post.category">{{ post.category }}</span>
        <span v-for="tag in post.tags ?? []" :key="tag">#{{ tag }}</span>
      </div>
    </header>

    <div class="post-body">
      <ContentRenderer :value="post" />
    </div>
  </article>
</template>
