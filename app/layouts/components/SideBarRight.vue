<script setup lang="ts">
import SiteToc from './SiteToc.vue'
</script>

<template>
  <aside
    class="flex flex-col gap-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh_-_4rem)] lg:self-start lg:overflow-y-auto"
  >
    <SiteToc class="hidden lg:block" />
  </aside>
</template>
