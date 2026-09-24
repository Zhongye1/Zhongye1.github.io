<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    language?: string
    /** 代码块处理器会带上源码；行内代码的源码走默认插槽 */
    code?: string
    copy?: boolean
  }>(),
  {
    code: '',
  },
)

const shiki = useShiki()
const codeElement = useTemplateRef('code')
const { copy: copyCode, copied } = useCopy(codeElement)
const highlighted = ref(false)

onMounted(async () => {
  const el = codeElement.value
  if (!props.language || !el) return

  try {
    await shiki.mountInline(el, el.textContent ?? props.code, {
      language: props.language,
      transformerOptions: ['ignoreColorizedBrackets'],
    })
    // 高亮结果已内联进 DOM，此时再把源码文本撤掉，避免重复显示
    highlighted.value = true
  } catch (error) {
    // 行内代码高亮失败就保持纯文本，别把整页拖下水
    console.error('[inline-code] 高亮失败，保留纯文本', error)
  }
})
</script>

<template>
  <code ref="code" :class="{ copyable: copy }">
    <template v-if="!language || !highlighted">
      <slot>{{ code }}</slot>
    </template>
    <button v-if="copy" type="button" class="copy-button" aria-label="复制" @click="copyCode()">
      <span :class="copied ? 'i-tabler-check' : 'i-tabler-copy'" />
    </button>
  </code>
</template>

<style lang="scss" scoped>
// 行内代码的基础外观来自 content.scss，这里只补复制按钮相关的部分
code.copyable {
  padding-inline-end: 0.1em;
}

.copy-button {
  display: inline-flex;
  margin-inline-start: 0.2em;
  vertical-align: -0.2em;
  color: var(--c-text-3);
  transition: color 0.2s;

  &:hover,
  &:focus-visible {
    color: var(--c-primary);
  }
}
</style>
