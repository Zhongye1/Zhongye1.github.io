<script lang="ts" setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="container h-screen text-gray-900 dark:text-gray-200">
    <div class="w-660px m-auto">
      <header class="flex justify-between items-center py-2em text-18px">
        <span class="color-fade">Zhongye</span>
        <NavBar />
      </header>
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
