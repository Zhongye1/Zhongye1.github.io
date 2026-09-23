<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 不传插槽时的文本 */
    text?: string
    /** 悬浮提示，缺省时按 copy 生成「点击复制」 */
    tip?: string
    /** 图标类名（UnoCSS）。传空字符串或 true 表示用默认图标 */
    icon?: string | boolean
    /** 点击复制 */
    copy?: boolean
  }>(),
  { icon: undefined },
)

const tipSource = useTemplateRef<HTMLElement>('tip-source')

const { copy: copyText, copied } = useCopy(tipSource)

const tooltip = computed(() => props.tip || (props.copy ? '点击复制' : undefined))

/** 显式传了非空图标名就用它；否则复制成功后打勾、可复制时显示复制图标 */
const iconClass = computed(() => {
  if (typeof props.icon === 'string' && props.icon) return props.icon
  if (copied.value) return 'i-tabler-check'
  return props.copy ? 'i-tabler-copy' : undefined
})
</script>

<template>
  <span
    ref="tip-source"
    class="tip"
    :title="tooltip"
    tabindex="0"
    @click="props.copy && copyText()"
    @keydown.enter="props.copy && copyText()"
  >
    <slot>{{ text }}</slot>
    <span v-if="iconClass" :class="iconClass" class="tip-icon" />
  </span>
</template>

<style lang="scss" scoped>
.tip {
  position: relative;
  text-decoration: underline dashed var(--c-text-3);
  cursor: pointer;
  text-underline-offset: 4px;
}

.tip-icon {
  display: inline-block;
  font-size: 1em;
  vertical-align: middle;
}
</style>
