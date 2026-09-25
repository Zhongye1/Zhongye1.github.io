<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import siteConfig, { rssFeed, socials } from '@/site.config'
import SearchButton from '@/components/SearchButton.vue'

import NavBar from './NavBar.vue'

const isDark = useDark({
  storageKey: 'blog-theme-mode',
})
const toggleTheme = useToggle(isDark)

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
      <button
        type="button"
        class="hover"
        :aria-label="themeLabel"
        :title="themeLabel"
        @click="toggleTheme()"
      >
        <span class="dark:i-icon-park-outline-moon i-icon-park-outline-sun block" />
      </button>
    </div>
  </aside>
</template>
