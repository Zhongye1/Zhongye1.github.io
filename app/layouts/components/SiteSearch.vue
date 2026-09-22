<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

interface SearchItem {
  path: string
  title?: string
  description?: string
  tags?: string[]
}

const root = ref<HTMLElement | null>(null)
const keyword = ref('')
const open = ref(false)
const loading = ref(false)
const failed = ref(false)
const activeIndex = ref(0)
const items = shallowRef<SearchItem[]>([])

const results = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return []
  return items.value
    .filter((item) =>
      [item.title, item.description, ...(item.tags ?? [])].some((field) =>
        field?.toLowerCase().includes(query),
      ),
    )
    .slice(0, 8)
})

function resultClass(index: number) {
  return index === activeIndex.value ? 'bg-[var(--c-primary-soft)]' : 'hover:bg-[var(--c-bg-2)]'
}

watch(results, () => {
  activeIndex.value = 0
})

// 标题、摘要、标签都在本地过滤，等真正用到时再拉一次全量列表
async function loadItems() {
  if (items.value.length || loading.value) return
  loading.value = true
  failed.value = false
  try {
    const docs = await queryCollection('posts').select('path', 'title', 'description', 'tags').all()
    items.value = docs.map((doc) => ({
      path: toBlogPath(doc.path),
      title: doc.title,
      description: doc.description,
      tags: doc.tags,
    }))
  } catch (error) {
    failed.value = true
    console.error('[site-search] failed to load posts', error)
  } finally {
    loading.value = false
  }
}

function focus() {
  open.value = true
  loadItems()
}

function close() {
  open.value = false
}

function move(step: number) {
  const total = results.value.length
  if (!total) return
  activeIndex.value = (activeIndex.value + step + total) % total
}

function go() {
  const target = results.value[activeIndex.value]
  if (!target) return
  close()
  return navigateTo(target.path)
}

onClickOutside(root, close)
</script>

<template>
  <div ref="root" class="relative">
    <label
      class="flex items-center gap-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-bg-1)] px-3 py-2"
    >
      <span class="i-tabler-search color-fade shrink-0" />
      <input
        v-model="keyword"
        aria-label="Search posts"
        class="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--c-text-3)]"
        placeholder="Search posts"
        type="search"
        @focus="focus"
        @keydown.esc="close"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="go"
      />
    </label>

    <div
      v-if="open && keyword.trim()"
      class="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] py-2 shadow-lg"
    >
      <p v-if="loading" class="color-fade px-3 py-2 text-xs">Loading posts…</p>
      <p v-else-if="failed" class="color-fade px-3 py-2 text-xs">Search is unavailable</p>
      <p v-else-if="!results.length" class="color-fade px-3 py-2 text-xs">No posts found</p>
      <ul v-else class="flex flex-col">
        <li v-for="(item, index) in results" :key="item.path">
          <NuxtLink
            :to="item.path"
            class="flex flex-col gap-0.5 px-3 py-2 text-sm"
            :class="resultClass(index)"
            @click="close"
            @mouseenter="activeIndex = index"
          >
            <span class="truncate">{{ item.title }}</span>
            <span v-if="item.description" class="color-fade truncate text-xs">
              {{ item.description }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
