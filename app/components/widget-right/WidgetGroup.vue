<script setup lang="ts">
// 标题，组卡片
withDefaults(defineProps<{ title?: string }>(), { title: '' })
</script>

<template>
  <section class="widget-group">
    <hgroup class="widget-group-header">
      <slot name="title">{{ title }}</slot>
    </hgroup>

    <div class="widget-group-body">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.widget-group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  color: var(--c-text-2);

  &:empty {
    display: none;
  }
}

// 组内间距比侧栏的 gap-6 紧，靠间距差把这几张卡读成一组
.widget-group-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
