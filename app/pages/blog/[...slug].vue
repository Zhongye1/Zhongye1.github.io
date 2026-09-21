<script setup lang="ts">
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

useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.description,
})
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
