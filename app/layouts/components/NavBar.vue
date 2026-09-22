<script setup lang="ts">
import { navLinks } from '@/site.config'

const route = useRoute()

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function linkClass(path: string) {
  return isActive(path) ? 'c-[var(--c-primary)]' : 'hover'
}
</script>

<template>
  <nav
    class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm lg:flex-col lg:items-start lg:gap-y-2.5"
  >
    <NuxtLink
      v-for="link in navLinks"
      :key="link.path"
      :title="link.title"
      :to="link.path"
      class="w-fit"
      :class="linkClass(link.path)"
    >
      {{ link.title }}
    </NuxtLink>
  </nav>
</template>
