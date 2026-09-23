<script setup lang="ts">
// 搜索面板，结构对齐 @nuxt/ui v4 的 `DashboardSearch`：⌘K 开合、选中后关闭并清空。
// 面板本体、列表与焦点管理都是自写的 —— 本站没有 reka-ui。
//
// 检索是**混合**的：FTS（`useSearchCollection`）负责正文小节、排名与 `<mark>` 片段，
// 子串匹配负责中文兜底。原因见 `shared/utils/search.ts` 顶部：fts5 默认分词器把连续汉字
// 当成一个 token，纯 FTS 会让"可视化"这类子串查询落空。
import { useScrollLock } from '@vueuse/core'
import { useSiteSearch } from '@/composables/useSiteSearch'
import {
  matchPost,
  mergeSearchHits,
  normalizeQuery,
  sanitizeSnippet,
  sortPostsByDate,
  type SearchHit,
  type SearchablePost,
} from '~~/shared/utils/search'

/**
 * FTS 命中项。`@nuxt/content` 把 `SearchResult` 定义在内部模块里、没有从包根导出，
 * 这里按它的实际形状声明一份（字段与 `queryFTS` 的 select 一一对应）。
 */
interface FtsResult {
  id: string
  title: string
  /** 祖先标题链：页面标题 → 父级标题 */
  titles: string[]
  level: number
  content: string
  rank: number
  snippets?: {
    title?: string
    content?: string
  }
}

interface PostRecord extends SearchablePost {
  published?: string | null
}

interface PaletteItem extends SearchHit {
  group: string
  icon: string
}

const RESULT_LIMIT = 12
const RECENT_LIMIT = 5

/** 底部操作提示 */
const HINTS = [
  { keys: ['↑', '↓'], label: '选择' },
  { keys: ['↵'], label: '打开' },
  { keys: ['Esc'], label: '关闭' },
]

const { open, closeSearch } = useSiteSearch()

const dialogRef = useTemplateRef<HTMLElement>('dialogRef')
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

const query = ref('')
const activeIndex = ref(0)
const searching = ref(false)
const records = shallowRef<PostRecord[]>([])
const results = ref<FtsResult[]>([])

// immediate: true —— 组件首次挂载（也就是首次打开面板）时开始建索引
const { status, search } = useSearchCollection('posts')

// 面板只在首次打开后挂载，此时必定在客户端
const scrollLocked = useScrollLock(import.meta.client ? document.body : null)

const term = computed(() => normalizeQuery(query.value))
const debouncedTerm = refDebounced(term, 120)
const sortedPosts = computed(() => sortPostsByDate(records.value))

onMounted(async () => {
  try {
    const docs = await queryCollection('posts')
      .select('path', 'title', 'description', 'tags', 'date', 'published')
      .all()

    records.value = docs.map((doc) => ({
      path: doc.path,
      title: doc.title,
      description: doc.description,
      tags: doc.tags,
      // 本站两种 frontmatter 写法都有，统一成 date 再排序
      date: doc.published || doc.date || '',
    }))
  } catch (error) {
    console.error('[search] 加载文章列表失败', error)
  }
})

// 查询词变化后跑一次 FTS；用自增 id 丢弃过期结果，避免快速输入时旧结果覆盖新结果
let queryId = 0
watch(debouncedTerm, async (value) => {
  if (!value) {
    results.value = []
    searching.value = false
    return
  }

  const id = ++queryId
  searching.value = true
  try {
    const hits = await search(value, {
      limit: RESULT_LIMIT,
      snippet: { columns: ['title', 'content'], around: 24 },
    })
    if (id === queryId) results.value = hits
  } catch (error) {
    console.error('[search] 全文检索失败', error)
    if (id === queryId) results.value = []
  } finally {
    if (id === queryId) searching.value = false
  }
})

const ftsHits = computed<SearchHit[]>(() =>
  results.value.map((result) => ({
    id: result.id,
    title: result.title,
    titleHtml: result.snippets?.title ? sanitizeSnippet(result.snippets.title) : undefined,
    prefix: result.titles.length ? result.titles.join(' > ') : undefined,
    description: result.content,
    descriptionHtml: result.snippets?.content
      ? sanitizeSnippet(result.snippets.content)
      : undefined,
    level: result.level,
    rank: result.rank,
    source: 'fts',
  })),
)

const postHits = computed<SearchHit[]>(() =>
  sortedPosts.value
    .filter((post) => matchPost(post, term.value))
    .map((post) => ({
      id: post.path,
      title: post.title || post.path,
      description: post.description ?? undefined,
      source: 'post',
    })),
)

const recentHits = computed<SearchHit[]>(() =>
  sortedPosts.value.slice(0, RECENT_LIMIT).map((post) => ({
    id: post.path,
    title: post.title || post.path,
    description: post.description ?? undefined,
    source: 'post',
  })),
)

const listItems = computed<PaletteItem[]>(() => {
  // 空查询给"最近更新"，避免刚打开面板是一片空白
  const hits = term.value
    ? mergeSearchHits(ftsHits.value, postHits.value, RESULT_LIMIT)
    : recentHits.value

  return hits.map((hit) => ({
    ...hit,
    group: term.value ? '文章' : '最近更新',
    icon: hit.source === 'fts' && (hit.level ?? 1) > 1 ? 'i-tabler-hash' : 'i-tabler-file-text',
  }))
})

const activeDescendant = computed(() =>
  listItems.value.length ? `search-option-${activeIndex.value}` : undefined,
)

const hint = computed(() => {
  if (status.value === 'error') return '搜索不可用'
  if (term.value && (searching.value || status.value === 'loading')) return '正在检索…'
  if (!listItems.value.length) return term.value ? '没有匹配的结果' : '输入关键词搜索文章'
  return `${listItems.value.length} 条结果`
})

// 结果集变化后回到第一条，避免下标越界
watch(listItems, () => {
  activeIndex.value = 0
})

watch(open, async (value) => {
  scrollLocked.value = value

  if (value) {
    await nextTick()
    inputRef.value?.focus()
    return
  }

  query.value = ''
  results.value = []
  activeIndex.value = 0

  // 焦点还给入口按钮，键盘用户不会掉到文档开头
  if (dialogRef.value?.contains(document.activeElement)) {
    document.querySelector<HTMLElement>('[data-search-trigger]')?.focus()
  }
})

function move(step: number) {
  const total = listItems.value.length
  if (!total) return
  activeIndex.value = (activeIndex.value + step + total) % total
}

async function select(item?: PaletteItem) {
  if (!item) return

  closeSearch()
  await navigateTo(toBlogPath(item.id))
}

function keepFocusInside(event: KeyboardEvent) {
  const focusables = dialogRef.value?.querySelectorAll<HTMLElement>('input, button, [href]')
  if (!focusables?.length) return

  const first = focusables[0]!
  const last = focusables[focusables.length - 1]!

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Home':
      event.preventDefault()
      activeIndex.value = 0
      break
    case 'End':
      event.preventDefault()
      activeIndex.value = Math.max(listItems.value.length - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      select(listItems.value[activeIndex.value])
      break
    case 'Escape':
      event.preventDefault()
      closeSearch()
      break
    case 'Tab':
      keepFocusInside(event)
      break
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeSearch()" />

      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        aria-label="搜索文章"
        class="relative flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--c-border)] bg-[var(--c-bg)] shadow-2xl"
        @keydown="onKeydown"
      >
        <div class="flex items-center gap-2 border-b border-[var(--c-border)] px-4 py-3">
          <span class="i-tabler-search color-fade shrink-0" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-listbox"
            :aria-activedescendant="activeDescendant"
            aria-autocomplete="list"
            autocomplete="off"
            spellcheck="false"
            placeholder="搜索文章…"
            class="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--c-text-3)]"
          />
          <button
            type="button"
            class="color-fade shrink-0 rounded border border-[var(--c-border)] px-1.5 text-xs hover:text-[var(--c-text-1)]"
            aria-label="关闭搜索"
            @click="closeSearch()"
          >
            Esc
          </button>
        </div>

        <ul
          id="search-listbox"
          role="listbox"
          aria-label="搜索结果"
          class="min-h-0 flex-1 overflow-y-auto p-2"
        >
          <template v-for="(item, index) in listItems" :key="item.id">
            <li
              v-if="index === 0 || listItems[index - 1]?.group !== item.group"
              role="presentation"
              class="px-2 pt-2 pb-1 text-xs font-semibold text-[var(--c-text-3)]"
            >
              {{ item.group }}
            </li>

            <li
              :id="`search-option-${index}`"
              role="option"
              :aria-selected="index === activeIndex"
              class="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-sm"
              :class="index === activeIndex ? 'bg-[var(--c-primary-soft)]' : undefined"
              @click="select(item)"
              @mousemove="activeIndex = index"
            >
              <span :class="item.icon" class="color-fade mt-0.5 shrink-0 text-base" />

              <span class="flex min-w-0 flex-1 flex-col gap-0.5">
                <span class="flex items-center gap-2">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span
                    v-if="item.titleHtml"
                    class="truncate [&_mark]:bg-[var(--c-primary-soft)] [&_mark]:text-[var(--c-primary)]"
                    v-html="item.titleHtml"
                  />
                  <span v-else class="truncate">{{ item.title }}</span>
                </span>

                <span v-if="item.prefix" class="truncate text-xs text-[var(--c-text-3)]">
                  {{ item.prefix }}
                </span>

                <!-- eslint-disable-next-line vue/no-v-html -->
                <span
                  v-if="item.descriptionHtml"
                  class="line-clamp-2 text-xs text-[var(--c-text-3)] [&_mark]:bg-[var(--c-primary-soft)] [&_mark]:text-[var(--c-primary)]"
                  v-html="item.descriptionHtml"
                />
                <span
                  v-else-if="item.description"
                  class="line-clamp-2 text-xs text-[var(--c-text-3)]"
                >
                  {{ item.description }}
                </span>
              </span>
            </li>
          </template>
        </ul>

        <div
          class="flex items-center justify-between gap-3 border-t border-[var(--c-border)] px-4 py-2 text-xs text-[var(--c-text-3)]"
        >
          <span>{{ hint }}</span>
          <span class="hidden items-center gap-1 sm:flex">
            <template v-for="(group, index) in HINTS" :key="index">
              <kbd
                v-for="key in group.keys"
                :key="key"
                class="rounded border border-[var(--c-border)] px-1"
              >
                {{ key }}
              </kbd>
              <span>{{ group.label }}</span>
            </template>
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
