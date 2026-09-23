<script setup lang="ts">
import type { WidgetDlItem } from './WidgetDl.vue'
import siteConfig from '@/site.config'

const { stats } = await useBlogStats()
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

const items = computed<WidgetDlItem[]>(() => [
  {
    label: '建站时长',
    value: `${daysSince(siteConfig.startDate, now.value)} 天`,
  },
  {
    label: '文章数',
    value: String(stats.value.posts),
  },
  {
    label: '总字数',
    value: formatNumber(stats.value.words) || '--',
    tip: yearlyTip.value || undefined,
  },
])
</script>

<template>
  <WidgetCard card title="博客统计">
    <WidgetDl :items="items" size="small" />
  </WidgetCard>
</template>
