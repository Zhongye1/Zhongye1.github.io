<script setup lang="ts">
// 侧边栏主导航
import { navLinks } from '@/site.config'

const route = useRoute()

// 手机端默认收起，靠上面的开关唤出；桌面端开关不渲染、导航常驻。
// 两边的显隐都由 CSS 断点决定（不是 JS 判断视口），SSR 首帧就是对的，也不会 hydration 不一致。
const open = ref(false)

// 布局在换页时不会重建，不重置的话点完链接这一列还摊在那儿
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

function isActive(path: string) {
  if (path === '/') return route.path === '/' || route.path.startsWith('/page/')
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <!--
      手机端的导航开关
    -->
    <button
      type="button"
      class="nav-toggle hidden max-lg:flex items-center gap-2 rounded-lg px-3 py-2 text-sm c-[var(--c-text-2)] transition duration-200 hover:bg-[var(--c-bg-soft)] hover:c-[var(--c-text-1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-primary)]"
      :aria-expanded="open"
      aria-controls="site-nav"
      @click="open = !open"
    >
      <span class="i-tabler-menu-2 nav-link-icon" />
      <span class="truncate">导航</span>
      <span
        class="i-tabler-chevron-down nav-link-icon ms-auto"
        :class="open ? 'rotate-180' : undefined"
      />
    </button>

    <!-- 收起时挂 `max-lg:hidden` -->
    <nav
      id="site-nav"
      class="flex flex-wrap items-stretch gap-1 text-sm lg:flex-col"
      :class="open ? undefined : 'max-lg:hidden'"
    >
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
  </div>
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
.nav-link.active .nav-link-icon,
.nav-toggle:hover .nav-link-icon,
.nav-toggle:focus-visible .nav-link-icon {
  opacity: 1;
}

/*
  开关里的箭头还要转，得把 transform 一起放进过渡：`.nav-link-icon` 那条 `transition: opacity`
  的特异度(0,2,0)高于 `transition-transform` 工具类(0,1,0)，会把它整条盖掉。
*/
.nav-toggle .nav-link-icon {
  transition:
    opacity 0.2s,
    transform 0.2s;
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
