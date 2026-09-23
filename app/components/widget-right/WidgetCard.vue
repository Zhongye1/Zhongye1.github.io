<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    /** 卡片底色 + 内边距 */
    card?: boolean
    /** 内部滚动（隐藏滚动条），给需要限高的长列表用 */
    shrink?: boolean
    /** 平时去色，进入侧栏或聚焦时恢复 */
    grayscale?: boolean
    /** 平时压暗，进入侧栏或聚焦时恢复 */
    dim?: boolean
    /** 卡片底图，填了才会渲染 */
    bgImg?: string
    /** 底图只占右半边并左侧渐隐 */
    bgAside?: boolean
  }>(),
  { card: false },
)
</script>

<template>
  <section class="widget" :class="{ shrink, grayscale, dim }">
    <hgroup class="widget-header">
      <slot name="title">
        {{ title }}
      </slot>
      <span v-if="$slots.action" class="seperator" />
      <slot name="action" />
    </hgroup>

    <div
      class="widget-body"
      :class="{ 'widget-card': card, 'with-bg': bgImg, 'no-scrollbar': shrink }"
    >
      <img
        v-if="bgImg"
        class="bg-img"
        :class="{ 'bg-right': bgAside }"
        :src="bgImg"
        alt=""
        loading="lazy"
      />
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.widget {
  flex-shrink: 1;
  font-size: 0.9em;

  &.shrink {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  &.grayscale :where(img, [class*='i-']) {
    filter: grayscale(0.6);
    transition: filter 0.2s;

    #site-aside:hover &,
    &:focus-within {
      filter: grayscale(0);
    }
  }

  &.dim {
    opacity: var(--widget-dim-opacity, 0.3);
    transition: opacity 0.2s;

    #site-aside:hover &,
    &:focus-within {
      opacity: 1;
    }
  }
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  color: var(--c-text-2);

  &:empty {
    display: none;
  }

  > .seperator {
    flex-grow: 1;
  }

  > :deep(a) {
    transition: color 0.2s;

    &[href]:hover {
      color: var(--c-primary);
    }
  }
}

.widget-body {
  overscroll-behavior: contain;

  &.with-bg {
    contain: paint;
    z-index: 0;

    > .bg-img {
      position: absolute;
      opacity: 0.2;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
      z-index: -1;

      &.bg-right {
        inset-inline-start: 50%;
        width: 50%;
        mask-image: linear-gradient(to right, transparent, #fff 50%);
      }
    }
  }

  &.widget-card {
    padding: 0.5rem 0.8rem;
    border-radius: 0.8rem;
    background-color: var(--c-bg-2);

    :deep(p) {
      padding: 0.2em 0;
    }
  }
}
</style>
