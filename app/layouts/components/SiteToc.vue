<script setup lang="ts">
// 外观对齐 nuxt-content 文档站的目录（@nuxt/ui v4 的 `ContentToc`）：
// 标题「目录」+ 缩进列表 + 当前项主色 + 跟随当前项的指示线（straight / circuit）。
//
// 这里只负责「皮肤」，结构与逻辑都在 headless 层：
//   TocTree             —— 只渲染 ul/li 与 data-* 标记，类名由这里按层级传进去
//   useTocScrollspy     —— 观察正文标题，产出当前高亮的标题 id
//   useTocHighlight     —— 把高亮换算成指示线的位移 / 高度 / mask
//   useActiveLinkScroll —— 当前项变化时把它滚到容器中间
// 未搬的部分是小屏折叠面板：本站在 lg 以下整列隐藏（见 SideBarRight），不需要第二套 DOM。
import type { TocLink } from '@nuxt/content'
import { usePageToc } from '@/composables/usePageToc'
import { useTocScrollspy } from '@/composables/useTocScrollspy'
import { useTocHighlight } from '@/composables/useTocHighlight'
import { useActiveLinkScroll } from '@/composables/useActiveLinkScroll'

const props = withDefaults(
  defineProps<{
    /** 是否显示指示线 */
    highlight?: boolean
    /** 指示线形态：straight = 跟随当前项的竖线，circuit = 树状电路板 */
    highlightVariant?: 'straight' | 'circuit'
  }>(),
  { highlight: true, highlightVariant: 'straight' },
)

const { toc } = usePageToc()
const router = useRouter()
const route = useRoute()
const listRef = useTemplateRef<HTMLElement>('listRef')

const { activeIds } = useTocScrollspy(toc)
const { activeIndex, indicatorStyle } = useTocHighlight({
  links: toc,
  activeIds,
  containerRef: listRef,
  // 传 getter 而不是快照，运行时切换形态也能跟着重算 mask
  variant: () => props.highlightVariant,
})
useActiveLinkScroll({ containerRef: listRef, activeIndex })

const isCircuit = computed(() => props.highlight && props.highlightVariant === 'circuit')

/** 点在地址栏里已有的锚点上时，router.push 会被判成重复导航而不滚动，这里手动补一次 */
function scrollToHeading(id: string) {
  const hash = `#${encodeURIComponent(id)}`
  if (route.hash === hash) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  router.push(hash)
}

function linkClass(id: string) {
  return activeIds.value.includes(id)
    ? 'c-[var(--c-primary)]'
    : 'c-[var(--c-text-3)] hover:c-[var(--c-text-1)]'
}

/** ul 的类名按层级与形态给，TocTree 只负责把它挂到对应的元素上 */
function listClass(level: number) {
  if (level > 0) return 'ms-3 min-w-0'
  if (!props.highlight) return 'min-w-0'
  return isCircuit.value
    ? 'min-w-0 ps-6.5'
    : 'min-w-0 ms-2.5 border-s border-[var(--c-border)] ps-4'
}

/** 有子级的 li 用 ps-px 顶开缩进，其余用 -ms-px 压住竖线：对齐原实现的 1px 微调 */
function itemClass(link: TocLink) {
  if (link.children?.length) return isCircuit.value ? 'min-w-0 ps-px' : 'min-w-0'
  return props.highlight ? 'min-w-0 -ms-px' : 'min-w-0'
}
</script>

<template>
  <nav v-if="toc.length" class="flex flex-col">
    <p class="sticky top-0 z-1 flex shrink-0 items-center gap-1.5 py-1.5 text-sm font-semibold">
      <span class="truncate">目录</span>
    </p>

    <div ref="listRef" class="relative flex flex-col py-2">
      <!--
        指示线：绝对定位且不写 top，靠「绝对定位子元素的静态位置 = 容器内容盒起点」对齐
        第一条链接（容器有 py-2，写 top-0 会高出 8px）。
        位移变量与 circuit 的树状 mask 都挂在容器上：滑块是被 mask 裁剪的子元素，
        于是高亮会顺着电路走，经过拐角时沿斜线穿过去。
      -->
      <div
        v-if="props.highlight"
        data-toc-indicator
        class="absolute start-0 ms-2.5"
        :class="
          isCircuit
            ? undefined
            : 'h-[var(--toc-indicator-size)] w-px translate-y-[var(--toc-indicator-position)] rounded-full transition-[transform,height] duration-200 ease-out motion-reduce:transition-none'
        "
        :style="indicatorStyle"
      >
        <div
          v-if="isCircuit"
          data-toc-indicator-line
          class="absolute inset-0 bg-[var(--c-border)]"
        />
        <div
          v-if="activeIndex >= 0"
          data-toc-indicator-active
          :class="
            isCircuit
              ? 'absolute h-[var(--toc-indicator-size)] w-full translate-y-[var(--toc-indicator-position)] bg-[var(--c-primary)] transition-[transform,height] duration-200 ease-out motion-reduce:transition-none'
              : 'h-full w-full bg-[var(--c-primary)]'
          "
        />
      </div>

      <TocTree v-slot="{ link }" :links="toc" :list-class="listClass" :item-class="itemClass">
        <a
          :href="`#${link.id}`"
          data-toc-link
          class="group relative flex items-center rounded-sm py-1 text-sm transition-colors"
          :class="linkClass(link.id)"
          @click.prevent="scrollToHeading(link.id)"
        >
          <span data-toc-text class="truncate">{{ link.text }}</span>
        </a>
      </TocTree>
    </div>
  </nav>
</template>
