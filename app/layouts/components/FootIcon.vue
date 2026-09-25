<script setup lang="ts">
// 页脚条目的图标。默认是 UnoCSS 图标类名，也允许直接给图片地址（备案那种找不到合适图标的）。
const props = defineProps<{
  /** UnoCSS 类名（如 i-tabler-rss）；或图片地址（外链 / 站内静态文件 / data URI） */
  icon: string
}>()

/** 图片地址走 <img>，其余当图标类名。类名里不会出现 `//` 或文件扩展名，按形状判断足够稳 */
const isImage = computed(
  () =>
    /^(?:https?:)?\/\//.test(props.icon) ||
    props.icon.startsWith('data:image/') ||
    /\.(?:png|jpe?g|svg|webp|gif|avif|ico)$/i.test(props.icon),
)
</script>

<template>
  <img v-if="isImage" class="icon" :src="props.icon" alt="" loading="lazy" />
  <span v-else class="icon" :class="props.icon" />
</template>

<style scoped>
.icon {
  flex-shrink: 0;
  font-size: 1.2em;
}

/* 图片图标按同一个 1.2em 方框等比缩放，才能和字体图标对齐 */
img.icon {
  width: 1.2em;
  height: 1.2em;
  object-fit: contain;
}
</style>
