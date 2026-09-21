<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    code?: string
    language?: string
    filename?: string
    /** @deprecated 请改用 transformerNotationHighlight 的注释语法 */
    highlights?: number[]
    meta?: string
    class?: string
  }>(),
  {
    code: '',
    meta: '',
    // Nuxt Content 已经保证 language 有值
    language: 'text',
  },
)

interface CodeblockMeta {
  icon?: string
  wrap?: boolean
  expand?: boolean
  indent?: string
  [meta: string]: string | boolean | undefined
}

const meta = computed(() =>
  props.meta.split(' ').reduce((acc: CodeblockMeta, item) => {
    const [key, value] = item.split('=')
    acc[key!] = value ?? true
    return acc
  }, {}),
)

const appConfig = useAppConfig()
const compConf = computed(() => appConfig.component.codeblock)

const rows = computed(() => props.code.split('\n').length - 1)
const collapsible = computed(() => !meta.value.expand && rows.value > compConf.value.triggerRows)
const [isCollapsed, toggleCollapsed] = useToggle(collapsible.value)

const icon = computed(
  () => meta.value.icon || getFileIcon(props.filename) || getLangIcon(props.language),
)
// UnoCSS 只认字面量类名，这些名字已列进 uno.config.ts 的 safelist
const iconClass = computed(() => `i-${icon.value.replace(':', '-')}`)
const isWrap = ref(meta.value.wrap)
const byteSize = computed(() => formatBytes(new TextEncoder().encode(props.code).length))

const codeblock = useTemplateRef('codeblock')
const { copy, copied } = useCopy(codeblock)
const shiki = useShiki()
// 先输出转义后的纯文本，客户端高亮接管前也不会闪
const rawHtml = ref(escapeHtml(props.code))

function getIndent() {
  if (meta.value.indent) return meta.value.indent
  if (['md', 'mdc', 'json', 'jsonc', 'yaml', 'yml'].includes(props.language)) return 2
  return compConf.value.indent
}

onMounted(async () => {
  rawHtml.value = await shiki.codeToHtml(props.code.trimEnd(), {
    language: props.language,
    transformerOptions: [
      compConf.value.enableIndentGuide ? 'ignoreRenderWhitespace' : 'ignoreRenderIndentGuides',
    ],
    shikiOptions: { meta: { indent: getIndent() } },
    embeddedLanguages: true,
  })
})
</script>

<template>
  <figure
    class="z-codeblock"
    :class="{ collapsed: collapsible && isCollapsed, collapsible }"
    :style="{
      '--collapsed-rows': compConf.collapsedRows,
      '--tab-size': meta.indent || compConf.tabSize,
    }"
  >
    <figcaption>
      <span v-if="filename" class="filename">
        <span :class="iconClass" />
        {{ filename }}
      </span>
      <span v-else />
      <!-- 语言不做绝对定位，它和文件名互斥占用同一块空间 -->
      <span v-if="language" class="language">{{ language }}</span>
      <div class="operations">
        <button type="button" @click="isWrap = !isWrap">
          {{ isWrap ? '横向滚动' : '自动换行' }}
        </button>
        <button type="button" @click="copy()">
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
    </figcaption>

    <pre ref="codeblock" class="shiki" :class="[props.class, { wrap: isWrap }]" v-html="rawHtml" />

    <button
      v-if="collapsible"
      type="button"
      class="toggle-btn"
      :aria-label="isCollapsed ? '展开代码块' : '折叠代码块'"
      @click="toggleCollapsed()"
    >
      <span class="i-tabler-chevrons-up toggle-icon" :class="{ 'is-collapsed': isCollapsed }" />
      <span>{{ rows }} lines, {{ props.code.length }} chars, {{ byteSize }}</span>
    </button>
  </figure>
</template>

<style lang="scss" scoped>
.z-codeblock {
  --line-height: 1.4;

  contain: paint;
  margin: 0.5em 0;
  border-radius: 0.5em;
  background-color: var(--c-bg-2);
  font-family: var(--font-monospace);
  font-size: 0.85em;
  line-height: 1.4;
  tab-size: var(--tab-size, 4);

  &.collapsible > pre {
    padding-bottom: 0.5rem;
  }

  &.collapsed > pre {
    overflow: hidden;
    max-height: calc(var(--line-height) * var(--collapsed-rows) * 1em + 1rem);
    mask-image: linear-gradient(to top, transparent -2em, #fff 4em);
    animation: none;
  }
}

figcaption {
  display: flex;
  justify-content: space-between;
  gap: 1em;
  position: sticky;
  top: 0;
  padding: 0 1em;
  z-index: 2;

  > .filename {
    padding: 0.2em 0.8em;
    border-radius: 0 0 0.5em 0.5em;
    background-color: var(--c-border);
    word-break: break-all;
  }

  > .language {
    opacity: 0.4;
    height: 0;
    transform: translateY(0.2em);
  }

  > .operations {
    position: absolute;
    opacity: 0;
    inset-inline-end: 0;
    padding: 0 0.6em;
    border-end-start-radius: 0.5em;
    background-color: var(--c-bg-2);
    transition: opacity 0.2s;

    :hover > &,
    :focus-within > & {
      opacity: 1;
    }

    > button {
      opacity: 0.4;
      padding: 0.2em 0.4em;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }
  }
}

pre {
  // 写 0 会在 calc() 里出错
  --start-offset: 4em;

  padding: 1rem;
  padding-inline-start: var(--start-offset);

  &.wrap {
    white-space: pre-wrap;
  }
}

:deep(.line) {
  &.diff {
    background-color: var(--ld-bg-active);

    &.add {
      --line-indicator: '+ ';
      --line-indicator-color: var(--c-success);
      --ld-bg-active: var(--c-success-soft);
    }

    &.remove {
      --line-indicator: '- ';
      --line-indicator-color: var(--c-error);
      --ld-bg-active: var(--c-error-soft);
    }
  }

  &.highlighted {
    --line-indicator-color: var(--c-text-1);

    background-color: var(--ld-bg-active);

    &.error {
      --line-indicator-color: var(--c-error);
      --ld-bg-active: var(--c-error-soft);
    }

    &.warning {
      --line-indicator-color: var(--c-warning);
      --ld-bg-active: var(--c-warning-soft);
    }
  }

  &.focused {
    --line-indicator: '→ ';
    --line-indicator-color: var(--c-text-1);

    display: inline-block;
    position: relative;
    box-shadow: 0 0 10rem 4rem var(--c-bg-2);
    transition: box-shadow 0.2s;

    @supports (color: color-mix(in srgb, transparent, transparent)) {
      box-shadow: 0 0 0 100vmax color-mix(in srgb, transparent, var(--c-bg-2));
    }

    pre:hover > & {
      box-shadow: none;
    }
  }

  // 行号指示器：用 fixed 定位，横向滚动时固定在左侧
  &::before {
    content: var(--line-indicator, '') attr(data-line);
    position: fixed;
    inset-inline-start: 0;
    width: var(--start-offset);
    padding-inline-end: 1em;
    background-color: var(--c-bg-2);
    text-align: end;
    color: var(--line-indicator-color, var(--c-text-3));
    z-index: 1;
  }

  > .highlighted-word {
    border-radius: 0.2em;
    box-shadow: inset 0 0 0 1em var(--ld-bg-active);
  }
}

.toggle-btn {
  display: block;
  position: relative; // 盖到 pre 上方
  opacity: 0.3;
  width: 100%;
  padding: 0.2em;
  background-color: var(--c-bg-3);
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.toggle-icon {
  display: inline-block;
  margin-inline-end: 0.2em;
  transition: all 0.2s;

  &.is-collapsed {
    transform: rotate(180deg);
  }
}
</style>
