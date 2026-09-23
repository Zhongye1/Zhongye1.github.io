<script setup lang="ts">
// 侧边栏主导航
import { navLinks } from '@/site.config'

const route = useRoute()

function isActive(path: string) {
  if (path === '/') return route.path === '/' || route.path.startsWith('/page/')
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="flex flex-wrap items-stretch gap-1 text-sm lg:flex-col">
    <NuxtLink
      v-for="link in navLinks"
      :key="link.path"
      :to="link.path"
      :aria-current="route.path === link.path ? 'page' : undefined"
      class="nav-link"
      :class="{ active: isActive(link.path) }"
    >
      <span v-if="link.icon" :class="link.icon" class="nav-link-icon" />
      <span class="truncate">{{ link.title }}</span>
      <span class="nav-link-dot" />
    </NuxtLink>
  </nav>
</template>

<style scoped>
/*
  悬停 / 当前项的图标与标记。底色与文字色的悬停态在 uno.config.ts 的 `nav-link` 快捷类里，
  特异性 (0,2,0) 低于这里的 scoped 选择器，所以高亮不会被 `:hover` 盖掉。
*/
.nav-link-icon {
  flex-shrink: 0;
  font-size: 1.125rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.nav-link:hover .nav-link-icon,
.nav-link.active .nav-link-icon {
  opacity: 1;
}

.nav-link.active {
  background-color: var(--c-bg-soft);
  color: var(--c-text-1);
}

/* 平时不占位也不可见，只有当前项才现身 —— 和 v3 用 `::after` 追加标记同一个效果 */
.nav-link-dot {
  display: none;
}

.nav-link.active .nav-link-dot {
  display: block;
  width: 0.25rem;
  height: 0.25rem;
  margin-inline-start: auto;
  border-radius: 9999px;
  background-color: var(--c-text-3);
  flex-shrink: 0;
}
</style>
