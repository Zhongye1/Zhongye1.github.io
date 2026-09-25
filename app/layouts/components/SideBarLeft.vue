<script setup lang="ts">
import siteConfig, { rssFeed, socials } from '@/site.config'
import SearchButton from '@/components/SearchButton.vue'

import NavBar from './NavBar.vue'

// 主题状态与「圆形揭示」切换动画都在这个 composable 里（useDark 的 disableTransition
// 那处坑也记在那儿）。开关只上报目标状态和触发事件，动画的起点由事件坐标决定。
const { isDark, setTheme } = useTheme()

const themeLabel = computed(() => (isDark.value ? 'Switch to light theme' : 'Switch to dark theme'))
</script>

<template>
  <!--
    分类 / 标签两张卡片加进来之后，这一列会比视口高。`position: sticky` 的元素一旦超过视口高度，
    底部就永远滚不到，所以和右栏一样限高 + 自己滚（见 SideBarRight 的同一处处理）。
  -->
  <aside
    class="no-scrollbar flex flex-col gap-5 lg:sticky lg:top-8 lg:max-h-[calc(100vh_-_4rem)] lg:self-start lg:overflow-y-auto"
  >
    <div class="flex flex-col gap-1.5">
      <NuxtLink to="/" class="text-lg font-semibold">{{ siteConfig.title }}</NuxtLink>
      <p class="color-fade text-sm leading-relaxed">{{ siteConfig.description }}</p>
    </div>
    <SearchButton />

    <NavBar />

    <WidgetCategories />
    <WidgetTags />

    <div class="flex items-center gap-3 text-lg">
      <a
        v-for="social in socials"
        :key="social.url"
        class="hover"
        :class="social.icon"
        :href="social.url"
        :title="social.title"
        rel="noreferrer"
        target="_blank"
      />
      <!-- 订阅入口。type 保留 rss+xml，浏览器扩展（Feedbro、RSSHub Radar 等）认它 -->
      <a
        class="hover i-tabler-rss"
        :href="rssFeed.path"
        type="application/rss+xml"
        :title="rssFeed.title"
        :aria-label="rssFeed.title"
        rel="noreferrer"
        target="_blank"
      />
      <!--
        昼夜开关换成动画组件。它按内部状态决定球的昼夜位置，而服务端既没有 localStorage
        也没有 matchMedia，只能渲染成白天 —— 塞进 ClientOnly，让客户端首帧直接就是真实主题：
        既不会有 hydration 不一致，也不会在加载时自己从白天滑到夜间。
        fallback 占位块与开关同尺寸（size=20 ⇒ 20×50），挂载时这一行不会跳。
        开关把触发交互一起报上来（第二个参数），setTheme 靠它的坐标决定揭示动画的圆心。
      -->
      <ClientOnly>
        <WigetDayNightSwitcher
          :size="20"
          :status="isDark"
          :aria-label="themeLabel"
          :title="themeLabel"
          @on-status="setTheme"
        />
        <template #fallback>
          <span class="inline-block h-5 w-[50px]" aria-hidden="true" />
        </template>
      </ClientOnly>
    </div>
  </aside>
</template>
