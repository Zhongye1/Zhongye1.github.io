<script setup lang="ts">
// 列表视图：标题行 + 文章卡片 + 分页条。
// 数据与页码校验留在页面里（`/blog` 与 `/blog/page/N` 各自负责自己的越界处理），
// 这里只负责渲染。
import Pagination from '@/components/Pagination.vue'
import SearchButton from '@/components/SearchButton.vue'

interface BlogPost {
  path: string
  title?: string | null
  description?: string | null
  date?: string | null
  published?: string | null
  category?: string | null
  tags?: string[] | null
}

const props = defineProps<{
  posts: BlogPost[]
  page: number
  totalPages: number
  /** 页面标题，第 2 页起会带上页码 */
  title?: string
}>()
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-bold">{{ props.title ?? 'Blog' }}</h1>

      <SearchButton collapsed label="搜索文章" />
    </div>

    <p v-if="!props.posts.length" class="color-fade">No posts yet.</p>

    <ul v-else class="flex flex-col gap-7">
      <li v-for="post in props.posts" :key="post.path">
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

    <Pagination :page="props.page" :total-pages="props.totalPages" sticky />
  </section>
</template>
