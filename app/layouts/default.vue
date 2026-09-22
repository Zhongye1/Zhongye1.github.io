<script lang="ts" setup>
import FootBar from './components/FootBar.vue'
import SideBarLeft from './components/SideBarLeft.vue'
import SideBarRight from './components/SideBarRight.vue'
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
  </div>
</template>
