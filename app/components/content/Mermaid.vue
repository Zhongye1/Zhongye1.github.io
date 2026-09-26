<script setup lang="ts">
const props = defineProps<{
  code: string
}>()

const container = useTemplateRef('mermaid')
const [scroll, toggleScroll] = useToggle(true)

// 直接跟随 <html> 上的 dark 类，免得和导航栏的主题状态各存一份
const isDark = ref(false)
onMounted(() => {
  const root = document.documentElement
  const sync = () => (isDark.value = root.classList.contains('dark'))
  sync()
  useMutationObserver(root, sync, { attributes: true, attributeFilter: ['class'] })
})

const id = useId()
// mermaid 会移除 DOM 中同 id 的旧图，故每次渲染另起 id，避免切换主题时高度塌陷
let renderCount = 0

// mermaid 体积较大，接近视口时才动态引入；隐藏容器（如 Tab）内不渲染，避免量取到错误尺寸
const isVisible = useElementVisibility(container, { rootMargin: '50%' })
const shouldRender = ref(false)
whenever(isVisible, () => (shouldRender.value = true), { once: true })

const diagram = computedAsync<{ svg?: string; width?: number; error?: string }>(async () => {
  // 异步依赖需要在 await 之前读取
  const { code } = props
  const darkMode = isDark.value
  if (!shouldRender.value) return {}

  try {
    const { default: mermaid } = await import('mermaid')
    // 等主题类名和字体就绪，否则取到旧配色、量出偏窄的文本
    await Promise.all([nextTick(), document.fonts.ready])

    const style = getComputedStyle(document.documentElement)
    const cssVar = (name: string) => style.getPropertyValue(name)

    mermaid.initialize({
      fontFamily: 'inherit',
      // 必须在 load 事件前关闭，否则 mermaid 会自行扫描并接管页面元素
      startOnLoad: false,
      suppressErrorRendering: true,
      // themeVariables 只对 base 主题生效，其余主题会重算这些颜色
      theme: 'base',
      themeVariables: {
        darkMode,
        background: cssVar('--c-bg-1'),
        edgeLabelBackground: cssVar('--c-bg-2'),
        primaryBorderColor: cssVar('--c-primary'),
        primaryColor: cssVar('--c-primary-soft'),
        primaryTextColor: cssVar('--c-text-1'),
        textColor: cssVar('--c-text-1'),
      },
    })

    const { svg } = await mermaid.render(`${id}-${renderCount++}`, code)
    // 保留原始画布宽度，超宽图表在容器内滚动
    const width = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('svg')
      ?.viewBox.baseVal.width

    return { svg, width }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}, {})
</script>

<template>
  <div ref="mermaid" class="mermaid-diagram">
    <div
      v-if="diagram.svg"
      class="mermaid-viewport"
      tabindex="0"
      role="region"
      aria-label="Mermaid 图表"
      @click="toggleScroll()"
    >
      <div
        :style="{ minWidth: scroll && diagram.width ? `${diagram.width}px` : undefined }"
        v-html="diagram.svg"
      />
    </div>
    <template v-else-if="diagram.error">
      <details class="mermaid-error">
        <summary>图表渲染失败，查看错误详情</summary>
        <pre>{{ diagram.error }}</pre>
      </details>
      <ProsePre :code="code" language="mermaid" meta="wrap" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
// 不能命名为 .mermaid：mermaid 会按该类名自动扫描并接管元素
.mermaid-diagram {
  margin: 0.5em 0;
  // mermaid 在 <body> 下量取文本，这里需与根元素排版一致，否则图形错位
  line-height: 1.4;
}

.mermaid-viewport {
  overflow-x: auto;

  :deep(svg) {
    display: block;
    height: auto;
    max-width: 100%;
    margin-inline: auto;
  }

  // 文本标签由 foreignObject 承载，会继承文章的段落样式
  :deep(p) {
    margin: 0;
  }
}

.mermaid-error {
  font-size: 0.85em;
  color: var(--c-text-2);

  summary {
    color: var(--c-error);
    cursor: pointer;
  }

  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
}
</style>
