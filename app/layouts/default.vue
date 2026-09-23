<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import { useSiteSearch } from '@/composables/useSiteSearch'
import FootBar from './components/FootBar.vue'
import SearchPalette from '@/components/SearchPalette.vue'
import SideBarLeft from './components/SideBarLeft.vue'
import SideBarRight from './components/SideBarRight.vue'

const { opened, toggleSearch } = useSiteSearch()

// ⌘K / Ctrl+K：对齐上游 `defineShortcuts({ meta_k })` 的语义 —— 焦点在输入框里也生效，
// 所以要拦下浏览器默认行为（Chrome 的 ⌘K 会去聚焦地址栏）。
// 只在这里注册一次：放到 composable 里会让每个调用方都挂一个监听。
useEventListener(
  window,
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return

    event.preventDefault()
    toggleSearch()
  },
  { passive: false },
)
</script>

<template>
  <div class="container flex min-h-screen flex-col">
    <div
      class="mx-auto flex w-full max-w-80vw flex-1 flex-col gap-8 px-6 py-8 lg:flex-row lg:gap-10 lg:px-8"
    >
      <SideBarLeft class="lg:w-200px lg:shrink-0" />
      <main class="min-w-0 flex-1">
        <slot />
      </main>
      <SideBarRight class="lg:w-240px lg:shrink-0" />
    </div>
    <FootBar />

    <!--
      首次打开后才挂载：`useSearchCollection` 会在挂载时建 FTS 索引，
      挂载一次就常驻（关掉只是隐藏），既不重复建索引，也免得从不搜索的访客白付这份开销。
    -->
    <SearchPalette v-if="opened" />
  </div>
</template>
