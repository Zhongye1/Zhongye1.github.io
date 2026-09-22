<script setup lang="ts">
import siteConfig, { socials } from '@/site.config'

const year = new Date().getFullYear()
const copyright = year > siteConfig.startYear ? `${siteConfig.startYear} - ${year}` : `${year}`
</script>

<template>
  <footer class="mt-auto border-t border-[var(--c-border)] py-6">
    <div
      class="color-fade mx-auto flex w-full max-w-1200px flex-col items-center gap-2 px-6 text-xs sm:flex-row sm:justify-between lg:px-8"
    >
      <p>© {{ copyright }} {{ siteConfig.author }}</p>
      <div class="flex items-center gap-4">
        <a
          v-for="social in socials"
          :key="social.url"
          class="hover"
          :href="social.url"
          rel="noreferrer"
          target="_blank"
        >
          {{ social.title }}
        </a>
        <span>Powered by Nuxt Content</span>
      </div>
    </div>
  </footer>
</template>
