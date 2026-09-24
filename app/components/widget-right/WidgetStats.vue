<script setup lang="ts">
import type { WidgetDlItem } from './WidgetDl.vue'
import siteConfig from '@/site.config'

const { stats } = await useBlogStats()
// 访客数 / 访问量来自 Cloudflare Worker，只能客户端取；见 useVisitorStats 里的说明
const { visitors, visits } = useVisitorStats()
const {
  public: { buildTime },
} = useRuntimeConfig()

const now = ref(buildTime)
onMounted(() => {
  now.value = new Date().toISOString()
})

const yearlyTip = computed(() =>
  stats.value.annual
    .map((item) => `${item.year} 年：${item.posts} 篇，${formatNumber(item.words)} 字`)
    .join('\n'),
)

/**
 * 访客数与访问量都精确到个位，刻意不走 formatNumber。
 *
 * 这两个数是**累计值**，压成「9.3 万」之后就再也看不出今天涨没涨——而这正是
 * 盯着它们唯一的用处。总字数动辄几十万，那边继续用「万」。
 */
function exact(value: number | null) {
  return value === null ? '--' : String(value)
}

const items = computed<WidgetDlItem[]>(() => [
  {
    label: '建站时长',
    value: `${daysSince(siteConfig.startDate, now.value)} 天`,
  },
  // {
  //   label: '文章数',
  //   value: String(stats.value.posts),
  // },
  {
    label: '总字数',
    value: formatNumber(stats.value.words) || '--',
    tip: yearlyTip.value || undefined,
  },
  {
    label: '访客数',
    value: exact(visitors.value),
  },
  {
    label: '访问量',
    value: exact(visits.value),
  },
])
</script>

<template>
  <WidgetCard card title="博客统计">
    <WidgetDl :items="items" size="small" />
  </WidgetCard>
</template>
