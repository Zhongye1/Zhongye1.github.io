<script setup lang="ts">
import { toBlogPath } from '@/utils/content'

const { status, errorMessage, ensureScript, init } = useTwikoo()

const commentEl = useTemplateRef('comment')
const containerId = '#tcomment'

/**
 * 评论用的页面路径。
 */
const path = computed(() => {
  const route = useRoute()
  return toBlogPath(route.path)
})

const statusText = computed(() => {
  if (status.value === 'error') return errorMessage.value
  if (status.value === 'ready') return ''
  return '评论加载中…'
})

onMounted(async () => {
  try {
    await ensureScript()
  } catch {
    // 失败态已经进 status，占位文案会换成 errorMessage；这里不用再做什么
    return
  }
  init(containerId)
})

/* ------------------------------------------------------------------ 外链确认
 *
 * 评论里的链接是别人写的，点了直接跳走（新标签页也一样）容易被钓。参考实现
 * `blog-v3` 的做法是拦下 `a[target="_blank"]`，先弹一个可编辑的气泡让你看清落点。
 *
 * 只拦评论正文里的链接：头像、翻页、管理入口都不是 `target="_blank"` 的正文链接，
 * 没必要也不该拦。
 */

const jumpTo = ref('')
const edited = ref('')
const confirming = ref(false)

/** 气泡坐标：相对组件根元素（它是定位上下文），点击时现算 */
const anchor = ref({ left: 0, top: 0 })

const popoverEl = useTemplateRef<HTMLElement>('popover')
const inputEl = useTemplateRef<HTMLElement>('popover-input')

/** 气泡宽度上限（CSS 里同值）；现算坐标时要用到，写成常量免得两处各说各话 */
const POPOVER_MAX_WIDTH = 360
/** 与点击位置的间距 */
const POPOVER_GAP = 6

const canUndo = computed(() => edited.value !== jumpTo.value)

/**
 * 只放行普通 http(s) 链接。
 *
 * 气泡里的地址是可以手改的：`javascript:` / `data:` 那类伪协议一旦被粘回来再「访问」，
 * 就等于在读者自己的页面上执行它。
 * @param url 待检查的地址
 * @returns 是否是安全的 http(s) 地址
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 弹出确认气泡。
 *
 * 初次定位只用点击处的坐标；等气泡渲染出来、量到真实宽度后再收一次，免得贴右边被裁。
 * @param target 被点击的链接
 */
async function openConfirm(target: HTMLAnchorElement): Promise<void> {
  const linkRect = target.getBoundingClientRect()
  const hostRect = commentEl.value?.getBoundingClientRect()

  jumpTo.value = target.href
  edited.value = target.href
  confirming.value = true
  anchor.value = {
    left: Math.max(0, linkRect.left - (hostRect?.left ?? 0)),
    top: linkRect.bottom - (hostRect?.top ?? 0) + POPOVER_GAP,
  }

  await nextTick()

  const popover = popoverEl.value
  const host = commentEl.value
  if (!popover || !host) return

  const overflow = anchor.value.left + popover.offsetWidth - host.clientWidth
  if (overflow > 0) anchor.value.left = Math.max(0, anchor.value.left - overflow)

  inputEl.value?.focus()
}

function closeConfirm(): void {
  confirming.value = false
}

function confirmOpen(): void {
  const url = edited.value
  closeConfirm()
  if (!isSafeUrl(url)) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function undoEdit(): void {
  edited.value = jumpTo.value
}

useEventListener(
  commentEl,
  'click',
  (event) => {
    if (!(event.target instanceof Element)) return
    const target = event.target.closest('a[target="_blank"]')
    if (!(target instanceof HTMLAnchorElement)) return
    if (!isSafeUrl(target.href)) return

    event.preventDefault()
    void openConfirm(target)
  },
  { capture: true },
)
</script>

<template>
  <section ref="comment" class="post-comment">
    <h2 class="content-heading text-xl font-bold">评论区</h2>

    <p
      v-if="statusText"
      class="comment-status color-fade"
      :class="{ 'is-error': status === 'error' }"
    >
      {{ statusText }}
    </p>

    <!-- twikoo 把 Vue 应用挂到这个元素上，并在里面渲染自己的 .twikoo 根节点 -->
    <div :id="containerId.slice(1)" class="twikoo-host" />

    <div
      v-if="confirming"
      ref="popover"
      class="link-confirm"
      role="dialog"
      aria-label="确认要访问的外部链接"
      :style="{ left: `${anchor.left}px`, top: `${anchor.top}px` }"
    >
      <span
        ref="popover-input"
        class="link-confirm-input"
        contenteditable="plaintext-only"
        spellcheck="false"
        @input="edited = ($event.target as HTMLElement).textContent ?? ''"
        @keydown.enter.prevent="confirmOpen()"
        @keydown.esc.prevent="closeConfirm()"
        >{{ edited }}</span
      >

      <button
        v-if="canUndo"
        type="button"
        class="link-confirm-undo"
        aria-label="恢复原始地址"
        @click="undoEdit()"
      >
        <span class="i-tabler-arrow-back-up" />
      </button>

      <button type="button" class="link-confirm-open" @click="confirmOpen()">访问</button>
      <button type="button" class="link-confirm-cancel" aria-label="取消" @click="closeConfirm()">
        <span class="i-tabler-x" />
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.post-comment {
  // 气泡是绝对定位，锚点相对这里算
  position: relative;
  margin-top: 3rem;
}

.comment-status {
  margin: 1rem 0;
  font-size: 0.875rem;

  &.is-error {
    color: var(--c-error);
    // 错误文案里有换行与地址，别让它撑破容器
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
}

/* ---------------------------------------------------------------- 外链确认气泡 */

.link-confirm {
  position: absolute;
  z-index: 10;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  max-width: 360px;
  padding: 0.25rem 0.25rem 0.25rem 0.5rem;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  background: var(--c-bg-4);
  box-shadow: var(--box-shadow-2);
}

.link-confirm-input {
  min-width: 0;
  padding: 0.15em 0.25em;
  outline: none;
  font-size: 0.8125rem;
  // 长 URL 要能断行，否则气泡横向撑开
  overflow-wrap: anywhere;
  color: var(--c-text-2);
  cursor: text;

  &:focus-visible {
    border-radius: 0.25rem;
    outline: 2px solid var(--c-primary);
  }
}

.link-confirm button {
  flex-shrink: 0;
  padding: 0.2em 0.5em;
  border: none;
  border-radius: 0.35rem;
  background: transparent;
  font-size: 0.8125rem;
  color: var(--c-text-2);
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: var(--c-bg-soft);
    color: var(--c-text-1);
  }
}

.link-confirm-open {
  background: var(--c-primary-soft);
  color: var(--c-primary);
}

/* ---------------------------------------------------------------- twikoo 本体 */

:deep(.twikoo) {
  font-size: 0.9rem;

  .tk-comments-title,
  .tk-nick {
    font-weight: 600;
  }

  .tk-time,
  .tk-extras,
  .tk-footer {
    color: var(--c-text-3);
  }

  .tk-footer,
  .tk-extras {
    font-size: 0.8em;
  }

  .tk-input {
    font-family: var(--font-monospace);
  }

  // twikoo 自带圆角是方一点的小圆角，跟站内卡片对齐一下
  .tk-avatar,
  .tk-avatar-img {
    border-radius: 50%;
  }

  // 折叠的回复列表淡出，而不是硬切
  .tk-replies:not(.tk-replies-expand) {
    mask-image: linear-gradient(to top, transparent, #fff 4em);
  }

  .tk-expand {
    border-radius: 0.5rem;
    transition: background-color 0.1s;
  }

  // 正文里的链接：底色擦亮一条，跟站内文章链接的观感一致
  .tk-content a {
    background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat center
      bottom / 100% 0.1em;
    color: var(--c-primary);
    transition:
      background-size 0.2s,
      border-radius 0.2s;

    &:hover {
      border-radius: 0.3rem;
      background-size: 100% 100%;
    }
  }

  .tk-content img {
    border-radius: 0.5rem;
  }

  // 表情是 comment 内容里的图片，别让它撑成大图
  .tk-owo-emotion {
    width: auto;
    height: 1.4em;
    vertical-align: text-bottom;
  }
}

// 预览区比正文多一层包裹，链接与图片规则复用，这里只补列表与引用
:deep(:where(.tk-preview-container, .tk-content)) {
  pre {
    overflow: auto;
    border-radius: 0.5rem;
    font-size: 0.85em;
  }

  blockquote {
    margin: 0.5em 0;
    padding: 0.2em 0.5em;
    border-inline-start: 4px solid var(--c-border);
    border-radius: 4px;
    background-color: var(--c-bg-2);
    font-size: 0.9em;
  }

  :is(menu, ol, ul) {
    margin: 0.5em 0;
    padding-inline-start: 1.5em;
    list-style: revert;
  }

  p {
    margin: 0.2em 0;
  }
}
</style>
