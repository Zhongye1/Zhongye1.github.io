<script setup lang="ts">
import type { WidgetDlItem } from './WidgetDl.vue'
import { services } from '@/site.config'

const expanded = ref(false)

const serviceItems = computed<WidgetDlItem[]>(() =>
  services.map((service) => ({
    label: service.label,
    icon: service.icon,
    value: service.text,
  })),
)

// 构建信息
const buildItems: WidgetDlItem[] = [
  { label: 'Site', value: '0913' },
  { label: 'Nuxt', value: '4.5.2' },
  { label: 'Vue', value: '3.5.43' },
  { label: 'Content', value: '3.16.1' },
  { label: 'Node', value: 'v22.22.2' },
  { label: 'pnpm', value: '12.5.1' },
  { label: 'OS', value: 'linux' },
  { label: 'Arch', value: 'x86_64' },
]
</script>

<template>
  <WidgetCard card title="技术信息">
    <WidgetDl :items="serviceItems" />
    <WidgetExpand v-model="expanded" name="构建信息">
      <WidgetDl :items="buildItems" size="small" />
    </WidgetExpand>
  </WidgetCard>
</template>
