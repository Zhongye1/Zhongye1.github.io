<script setup lang="ts">
// 分页条，移植自 blog-v3 的 `partial/Pagination.vue`，含它的 sticky 折叠一手。
//
// 按本站的静态站策略改了两处：
//  1. 页码用 `<NuxtLink>` 而不是按钮 —— 路径分页要靠预渲染时的链接抓取，把
//     `/page/2..N` 全都生成出来，按钮点击对爬虫不可见；
//  2. 去掉上游的 `avoid`（它靠 Pinia store + 元素测量让分页条躲开评论区等悬浮元素，
//     本站没有这类元素）。
//
// 两态的宽度（与 blog-v3 一致）：展开态撑满内容列、箭头分列两端；折叠态收成窄条。
import { useElementVisibility } from '@vueuse/core'
import { getPaginationIndicator } from '~~/shared/utils/pagination'

const props = withDefaults(
  defineProps<{
    /** 当前页码 */
    page: number
    totalPages: number
    /** 第 1 页的路径，其余页拼成 `${base}/page/N` */
    base?: string
    /** 当前页两侧各展开几个页码 */
    expandPages?: number
    /** 贴底显示：滚到列表中段时收成页码胶囊，滚到列表末尾再展开 */
    sticky?: boolean
  }>(),
  { base: '/blog', expandPages: 2, sticky: false },
)

const pages = computed(() =>
  getPaginationIndicator(props.page, props.totalPages, props.expandPages),
)

// 底部锚点可见 = 已经滚到列表末尾，这时展开完整分页条
const anchorEl = useTemplateRef<HTMLElement>('anchor')
const expanded = useElementVisibility(anchorEl)
const collapsed = computed(() => props.sticky && !expanded.value)

// 页码格与两侧箭头同宽（都是 w-10 = 2.5rem）。用 rem 而不是 em 作基数：
// 数字带 `text-sm`、省略号不带，em 基数不同会让格子宽度对不上。
const CELL_WIDTH = 2.5

// 两态宽度（与 blog-v3 一致）：
// 展开态 = 撑满内容列，两侧箭头被 auto margin 顶到两端、页码居中；
// 折叠态 = 页码格压到 2rem、箭头保持 2.5rem 的窄条，箭头照常显示，悬浮时也能直接翻页。
// 折叠宽度写成 rem 长度而不是 fit-content：max-width 只在长度之间可过渡，折叠才平滑。
// 居中不用 `mx-auto`，走父级（列表容器）flex 交叉轴的 `self-center`；
// 因此宽度得由 `w-full` + `max-width` 决定 —— `self-center` 会让宽度收缩到内容，
// 只写它的话展开态就不再撑满内容列了。
const navStyle = computed(() => {
  const count = pages.value.length

  return {
    '--collapsed-width': `${count * 2 + 2 * CELL_WIDTH}rem`,
    maxWidth: collapsed.value ? 'min(var(--collapsed-width), 100%)' : '100%',
  }
})

function pageLink(target: number) {
  return target <= 1 ? props.base : `${props.base}/page/${target}`
}
</script>

<template>
  <!--
    包裹层必须是 `display: contents`（不生成盒子）：`position: sticky` 只能在包含块范围内移动，
    若这里是普通 div，它的高度就等于分页条自身，sticky 没有可移动空间、会退化成静态定位。
    不生成盒子后包含块上移到外面那个装着整个列表的容器，分页条才能在列表没读完时悬浮在视口底部，
    读到末尾再落回原位。
  -->
  <div class="contents">
    <nav
      v-if="totalPages > 1"
      class="flex w-full self-center overflow-hidden rounded-lg border border-[var(--c-border)] bg-[var(--c-bg-1)] tabular-nums transition-[max-width] duration-200 ease-out"
      :class="props.sticky ? 'sticky bottom-[min(2em,5%)] z-10' : undefined"
      :style="navStyle"
      :aria-label="`第 ${page} 页，共 ${totalPages} 页`"
    >
      <NuxtLink
        v-if="page > 1"
        :to="pageLink(page - 1)"
        class="me-auto flex w-10 shrink-0 items-center justify-center py-2 text-[var(--c-text-3)] transition-colors hover:bg-[var(--c-bg-2)] hover:text-[var(--c-text-1)]"
        aria-label="上一页"
      >
        <span class="i-tabler-arrow-left" />
      </NuxtLink>
      <span
        v-else
        class="me-auto flex w-10 shrink-0 items-center justify-center py-2 text-[var(--c-text-3)] opacity-40"
        aria-hidden="true"
      >
        <span class="i-tabler-arrow-left" />
      </span>

      <!-- 页码格可以压缩（折叠时与窄屏下），箭头 shrink-0 保持完整 -->
      <template v-for="(item, index) in pages" :key="index">
        <span
          v-if="!Number.isFinite(item)"
          class="flex w-10 items-center justify-center text-[var(--c-text-3)]"
          aria-hidden="true"
        >
          …
        </span>

        <span
          v-else-if="item === page"
          class="flex w-10 items-center justify-center bg-[var(--c-primary-soft)] py-2 text-sm text-[var(--c-primary)]"
          aria-current="page"
        >
          {{ item }}
        </span>

        <NuxtLink
          v-else
          :to="pageLink(item)"
          class="flex w-10 items-center justify-center py-2 text-sm transition-colors hover:bg-[var(--c-bg-2)]"
          :aria-label="`第 ${item} 页`"
        >
          {{ item }}
        </NuxtLink>
      </template>

      <NuxtLink
        v-if="page < totalPages"
        :to="pageLink(page + 1)"
        class="ms-auto flex w-10 shrink-0 items-center justify-center py-2 text-[var(--c-text-3)] transition-colors hover:bg-[var(--c-bg-2)] hover:text-[var(--c-text-1)]"
        aria-label="下一页"
      >
        <span class="i-tabler-arrow-right" />
      </NuxtLink>
      <span
        v-else
        class="ms-auto flex w-10 shrink-0 items-center justify-center py-2 text-[var(--c-text-3)] opacity-40"
        aria-hidden="true"
      >
        <span class="i-tabler-arrow-right" />
      </span>
    </nav>

    <div ref="anchor" aria-hidden="true" />
  </div>
</template>
