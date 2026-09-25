<script setup lang="ts">
// 页脚
import siteConfig, { footerNav } from '@/site.config'
import FootIcon from './FootIcon.vue'

const year = new Date().getFullYear()
const copyright = year > siteConfig.startYear ? `${siteConfig.startYear} - ${year}` : `${year}`

function isPlainLink(url: string) {
  return !url.startsWith('/') || /\.[a-z\d]+$/i.test(url)
}

const groups = footerNav.map((group) => ({
  title: group.title,
  items: group.items.map((item) => ({
    ...item,
    plain: !!item.url && isPlainLink(item.url),
  })),
}))
</script>

<template>
  <footer class="text-[0.9em] text-[var(--c-text-2)]">
    <div class="ml-25vw w-full max-w-1200px px-6 pb-10 lg:px-8">
      <nav aria-label="页脚导航" class="footer-nav">
        <div v-for="group in groups" :key="group.title">
          <h2 class="footer-nav-title">{{ group.title }}</h2>
          <menu>
            <li v-for="item in group.items" :key="item.text">
              <NuxtLink
                v-if="item.url"
                :to="item.url"
                :external="item.plain"
                :target="item.plain ? '_blank' : undefined"
                :rel="item.plain ? 'noreferrer' : undefined"
                class="footer-link"
              >
                <FootIcon :icon="item.icon" />
                <span>{{ item.text }}</span>
              </NuxtLink>
              <!-- 没有可跳转地址的条目（QQ 群号）只展示，不装成链接 -->
              <span v-else class="footer-link no-link">
                <FootIcon :icon="item.icon" />
                <span>{{ item.text }}</span>
              </span>
            </li>
          </menu>
        </div>
      </nav>
      <p class="footer-copyright">© {{ copyright }} {{ siteConfig.author }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 5vw clamp(2rem, 5%, 5vw);
  padding-block-end: 3rem;
}

/* 0.45em = 胶囊条目 0.5em 内边距 × 0.9em 字号，标题与条目里的图标左对齐 */
.footer-nav-title,
.footer-copyright {
  margin-inline: 0.45em;
}

.footer-nav-title {
  font-weight: 500;
}

/*
  胶囊条目：blog-v3 是 .blog-footer a { padding: .3em .5em; border-radius: .5em; font-size: .9em }
  配 :hover { background-color: var(--c-bg-soft); color: var(--c-text) }。
  hover 写在 scoped 选择器里，特异性高于 UnoCSS 的 hover: 变体，不会被别处盖掉。
*/
.footer-link {
  display: flex;
  align-items: center;
  gap: 0.3em;
  width: fit-content;
  padding: 0.3em 0.5em;
  border-radius: 0.5em;
  font-size: 0.9em;
  transition:
    background-color 0.2s,
    color 0.1s;
}

a.footer-link:hover {
  background-color: var(--c-bg-soft);
  color: var(--c-text-1);
}

a.footer-link:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}

/* 不可点击的那行：占住同样的位置，但不给悬停反馈 */
.footer-link.no-link {
  color: var(--c-text-3);
  cursor: default;
}
</style>
