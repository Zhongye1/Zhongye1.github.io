<script setup lang="ts">
// 列表页外壳：页面只负责「取哪一段文章、第几页」，布局与分页都在这里。
//
// 首页（`/`）与它的第 2..N 页（`/page/N`）共用它，所以文章列表那一份逻辑只有这一处。
// 归档页不走这里 —— `/archive` 是按年分组的标题列表（`ArchiveList`），不分页。
import BlogList from '@/components/BlogList.vue'
import { usePagination } from '@/composables/usePagination'

interface ListPost {
  path: string
  title?: string | null
  description?: string | null
  date?: string | null
  published?: string | null
  category?: string | null
  tags?: string[] | null
  cover?: string | null
  words?: number | null
}

const props = withDefaults(
  defineProps<{
    posts: ListPost[]
    /** 当前页码，默认第 1 页 */
    page?: number
    /** 第 1 页的路径；列表落在 `/` 时传 `''`（见 Pagination 的 base 注释） */
    base?: string
    /** 页面标题，默认「文章」 */
    title?: string
  }>(),
  { base: '' },
)

const { totalPages, listPaged } = usePagination(() => props.posts, { page: () => props.page ?? 1 })
</script>

<template>
  <BlogList
    :posts="listPaged"
    :page="page ?? 1"
    :total-pages="totalPages"
    :base="base"
    :title="title"
  />
</template>
