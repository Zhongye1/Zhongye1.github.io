<script setup lang="ts">
const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('posts')
    .select('path', 'title', 'description', 'date', 'published', 'category', 'tags')
    .all(),
)

const sortedPosts = computed(() =>
  (posts.value ?? []).toSorted((a, b) => postTimestamp(b) - postTimestamp(a)),
)
</script>

<template>
  <section class="flex flex-col gap-8">
    <h1 class="text-2xl font-bold">Blog</h1>

    <p v-if="!sortedPosts.length" class="color-fade">No posts yet.</p>

    <ul v-else class="flex flex-col gap-7">
      <li v-for="post in sortedPosts" :key="post.path">
        <NuxtLink :to="toBlogPath(post.path)" class="group block">
          <h2 class="content-heading text-lg font-medium transition-opacity group-hover:opacity-75">
            {{ post.title }}
          </h2>
          <p v-if="post.description" class="color-fade mt-1 text-sm">{{ post.description }}</p>
          <div class="color-fade mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <time v-if="formatPostDate(post)">{{ formatPostDate(post) }}</time>
            <span v-if="post.category">{{ post.category }}</span>
            <span v-for="tag in post.tags ?? []" :key="tag">#{{ tag }}</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
