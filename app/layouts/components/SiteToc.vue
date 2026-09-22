<script setup lang="ts">
// 外观对齐 nuxt-content 文档站的目录（@nuxt/ui v4 的 `ContentToc`）：
// 标题「目录」+ 缩进列表 + 当前项主色，滚动时高亮视口内的所有标题。
// 结构沿用它的层级：同级是 <ul>，子级递归渲染，缩进由嵌套列表的 margin 决定。
// 未搬的部分是小屏下的折叠面板和内容超出时的内部滚动条 —— 本站在 lg 以下
// 直接隐藏侧栏，滚动交给右栏容器。
import { createReusableTemplate } from '@vueuse/core'
import type { TocLink } from '@nuxt/content'
import { usePageToc } from '@/composables/usePageToc'

const [DefineListTemplate, ReuseListTemplate] = createReusableTemplate({
  props: {
    links: { type: Array as PropType<TocLink[]>, required: true },
    level: { type: Number, default: 0 },
  },
})

const { toc } = usePageToc()
const router = useRouter()
const nuxtApp = useNuxtApp()

const flatLinks = computed(() => flattenLinks(toc.value))
const activeIds = ref<string[]>([])
const visibleIds = ref<string[]>([])
let observer: IntersectionObserver | null = null

function flattenLinks(links: TocLink[]): TocLink[] {
  return links.flatMap((link) => [
    link,
    ...(link.children?.length ? flattenLinks(link.children) : []),
  ])
}

// 与 @nuxt/ui 的 `useScrollspy` 一致：视口内可见的标题都算高亮；
// 一个都不可见时保留上一次结果，避免滚到两段标题之间时高亮闪没。
function handleIntersect(entries: IntersectionObserverEntry[]) {
  const ids = new Set(visibleIds.value)
  let changed = false

  for (const entry of entries) {
    const id = entry.target.id
    if (!id) continue

    if (entry.isIntersecting) {
      if (!ids.has(id)) {
        ids.add(id)
        changed = true
      }
    } else if (ids.delete(id)) {
      changed = true
    }
  }

  if (changed) visibleIds.value = [...ids]
}

function observeHeadings() {
  if (!import.meta.client) return

  observer ??= new IntersectionObserver(handleIntersect)
  observer.disconnect()
  visibleIds.value = []

  // 直接按目录里的 id 找锚点，不再用选择器筛标题等级
  for (const link of flatLinks.value) {
    const heading = document.getElementById(link.id)
    if (heading) observer.observe(heading)
  }
}

function scrollToHeading(id: string) {
  router.push(`#${encodeURIComponent(id)}`)
}

function linkClass(id: string) {
  if (activeIds.value.includes(id)) return 'c-[var(--c-primary)]'
  return 'c-[var(--c-text-3)] hover:c-[var(--c-text-1)]'
}

function listClass(level: number) {
  if (level > 0) return 'ml-3'
  return undefined
}

watch(visibleIds, (ids, previous) => {
  activeIds.value = ids.length ? ids : previous
})

watch(flatLinks, () => nextTick(observeHeadings))

onMounted(() => nextTick(observeHeadings))

// 页面过渡结束后正文才渲染完，这时才找得到锚点
const offLoadingEnd = nuxtApp.hooks.hook('page:loading:end', () => nextTick(observeHeadings))
const offTransitionFinish = nuxtApp.hooks.hook('page:transition:finish', () =>
  nextTick(observeHeadings),
)

onBeforeUnmount(() => {
  observer?.disconnect()
  offLoadingEnd()
  offTransitionFinish()
})
</script>

<template>
  <nav class="flex flex-col">
    <div v-if="toc.length" class="flex flex-col py-8">
      <p class="-mt-1.5 flex flex-1 items-center gap-1.5 py-1.5 text-sm font-semibold">
        <span class="truncate">目录</span>
      </p>

      <DefineListTemplate v-slot="{ links, level }">
        <ul class="min-w-0" :class="listClass(level)">
          <li v-for="link in links" :key="link.id" class="min-w-0">
            <a
              :href="`#${link.id}`"
              class="group relative flex items-center rounded-sm py-1 text-sm transition-colors"
              :class="linkClass(link.id)"
              @click.prevent="scrollToHeading(link.id)"
            >
              <span class="truncate">{{ link.text }}</span>
            </a>

            <ReuseListTemplate
              v-if="link.children?.length"
              :links="link.children"
              :level="level + 1"
            />
          </li>
        </ul>
      </DefineListTemplate>

      <ReuseListTemplate :links="toc" :level="0" />
    </div>
  </nav>
</template>
