<script setup lang="ts">
import { community } from '@/site.config'
import SiteToc from './SiteToc.vue'
</script>

<template>
  <!--
    移动端整列隐藏。这里不能写成 `hidden ... flex`：UnoCSS 里 `.hidden` 的输出顺序排在
    `.flex` 之前，同权重下会被 `.flex` 覆盖 —— `<SiteToc class="hidden lg:block">` 之前正是
    这样失效的（目录在小屏照常显示）。改用 `max-lg:hidden` 变体：变体层排在基础层之后，必然生效。
    隐藏整列还顺带让空 aside 退出 default.vue 的 `gap-8`，正文底部不会多留一段空白。
  -->
  <aside
    id="site-aside"
    class="no-scrollbar flex flex-col gap-6 max-lg:hidden lg:sticky lg:top-8 lg:max-h-[calc(100vh_-_4rem)] lg:self-start lg:overflow-y-auto"
  >
    <SiteToc highlight-variant="circuit" />

    <!--
      下面三张卡片是全站常驻的：目录只存在于文章页，而统计/技术信息/社区没有这个限制
      —— SiteToc 自带 `v-if="toc.length"`，非文章页它就整块消失，这几张卡片会自然上移。
      组件来自 app/components/widget-right/（见 nuxt.config.ts 的 components 配置），自动导入。
    -->
    <WidgetStats />
    <WidgetTech />

    <!-- 社区是一个分组：标题只渲染一处，下面挂两张同款卡片 -->
    <WidgetGroup :title="community.title">
      <WidgetCommunity v-for="card in community.cards" :key="card.headline" :card />
    </WidgetGroup>
  </aside>
</template>
