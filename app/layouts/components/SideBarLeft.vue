<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import siteConfig, { socials } from '@/site.config'
import SiteSearch from './SiteSearch.vue'

import NavBar from './NavBar.vue'

const isDark = useDark({
  storageKey: 'blog-theme-mode',
})
const toggleTheme = useToggle(isDark)

const themeLabel = computed(() => (isDark.value ? 'Switch to light theme' : 'Switch to dark theme'))
</script>

<template>
  <aside class="flex flex-col gap-5 lg:sticky lg:top-8 lg:self-start">
    <div class="flex flex-col gap-1.5">
      <NuxtLink to="/" class="text-lg font-semibold">{{ siteConfig.title }}</NuxtLink>
      <p class="color-fade text-sm leading-relaxed">{{ siteConfig.description }}</p>
    </div>
    <SiteSearch />

    <NavBar />

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
