<script setup lang="ts">
import { hashString } from '@/utils/hash'

interface ImageItem {
  type: 'image'
  key: string
  src: string
  alt: string
  el: HTMLImageElement
}

interface MermaidItem {
  type: 'mermaid'
  key: string
  svg: string
  alt: string
  el: HTMLElement
}

type PreviewItem = ImageItem | MermaidItem

// 太小的图片多半是徽章、图标，不进轮选器
const MIN_IMAGE_SIZE = 64
const MIN_SCALE = 1
const MAX_SCALE = 4
const SCALE_STEP = 0.5

const items = ref<PreviewItem[]>([])
const activeIndex = ref(0)
const opened = ref(false)

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const dragging = ref(false)

const dialogRef = useTemplateRef<HTMLElement>('dialog')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')
const mainRef = useTemplateRef<HTMLElement>('main')
const mediaRef = useTemplateRef<HTMLElement>('media')

const current = computed(() => items.value[activeIndex.value])
const currentImage = computed(() => {
  const item = current.value
  return item?.type === 'image' ? item : null
})
const currentMermaid = computed(() => {
  const item = current.value
  return item?.type === 'mermaid' ? item : null
})
const counter = computed(() => `${activeIndex.value + 1} / ${items.value.length}`)
const mediaStyle = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${scale.value})`,
  cursor: scale.value > 1 ? (dragging.value ? 'grabbing' : 'grab') : 'zoom-in',
}))

let lastFocused: HTMLElement | null = null
let previousOverflow = ''
let previousPaddingRight = ''
let scrollLocked = false
let queryTimer: number | undefined

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isPreviewableImage(img: HTMLImageElement) {
  if (img.closest('.mermaid-diagram') || img.closest('a')) return false
  if (img.dataset.noPreview !== undefined) return false

  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height
  // 还没加载出来的图拿不到尺寸，先保留；已知长宽都很小的图标才排除
  return width === 0 || height === 0 || (width >= MIN_IMAGE_SIZE && height >= MIN_IMAGE_SIZE)
}

function toMermaidItem(container: HTMLElement): MermaidItem | null {
  const svg = container.querySelector('svg')
  if (!svg) return null

  // 去掉 Mermaid 写在根节点上的 max-width，交给预览容器重新定尺寸
  const clone = svg.cloneNode(true) as SVGElement
  clone.removeAttribute('style')
  clone.setAttribute('width', '100%')
  clone.setAttribute('height', '100%')

  return {
    type: 'mermaid',
    key: container.dataset.previewKey || `mermaid-${hashString(clone.outerHTML)}`,
    svg: clone.outerHTML,
    alt: container.dataset.alt || 'Mermaid 图表',
    el: container,
  }
}

function collectItems(root: HTMLElement): PreviewItem[] {
  // `img, .mermaid-diagram` 按文档顺序返回，正好是正文里的阅读顺序
  const nodes = root.querySelectorAll<HTMLElement>('img, .mermaid-diagram')
  const result: PreviewItem[] = []

  for (const node of nodes) {
    if (node instanceof HTMLImageElement) {
      if (!isPreviewableImage(node)) continue

      const src = node.currentSrc || node.src
      // key 用 src 属性而不是 currentSrc：不同屏幕选到不同 srcset 时深链仍然稳定
      const keySource = node.getAttribute('src') || src
      result.push({
        type: 'image',
        key: `img-${hashString(keySource)}`,
        src,
        alt: node.alt || '文章图片',
        el: node,
      })
      continue
    }

    const item = toMermaidItem(node)
    if (item) result.push(item)
  }

  return result
}

function lockScroll() {
  if (scrollLocked) return

  const root = document.documentElement
  previousOverflow = root.style.overflow
  previousPaddingRight = root.style.paddingRight

  // 隐藏滚动条前补上它占的宽度，避免页面内容横向跳一下
  const gap = window.innerWidth - root.clientWidth
  root.style.overflow = 'hidden'
  if (gap > 0) root.style.paddingRight = `${gap}px`
  scrollLocked = true
}

function unlockScroll() {
  if (!scrollLocked) return

  const root = document.documentElement
  root.style.overflow = previousOverflow
  root.style.paddingRight = previousPaddingRight
  scrollLocked = false
}

function clampOffsets() {
  const media = mediaRef.value
  if (!media || scale.value <= 1) {
    offsetX.value = 0
    offsetY.value = 0
    return
  }

  const maxX = (media.clientWidth * (scale.value - 1)) / 2
  const maxY = (media.clientHeight * (scale.value - 1)) / 2
  offsetX.value = clamp(offsetX.value, -maxX, maxX)
  offsetY.value = clamp(offsetY.value, -maxY, maxY)
}

function setScale(targetScale: number, focal?: { x: number; y: number }) {
  const target = clamp(targetScale, MIN_SCALE, MAX_SCALE)

  if (target === 1) {
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    return
  }

  if (focal) {
    const ratio = target / scale.value
    offsetX.value = focal.x - (focal.x - offsetX.value) * ratio
    offsetY.value = focal.y - (focal.y - offsetY.value) * ratio
  }

  scale.value = target
  clampOffsets()
}

function zoomIn() {
  setScale(scale.value + SCALE_STEP)
}

function zoomOut() {
  setScale(scale.value - SCALE_STEP)
}

function resetZoom() {
  setScale(1)
  pointers.clear()
  dragging.value = false
  pinchStart.distance = 0
}

function getFocal(clientX: number, clientY: number) {
  const main = mainRef.value
  if (!main) return undefined

  const rect = main.getBoundingClientRect()
  return {
    x: clientX - (rect.left + rect.width / 2),
    y: clientY - (rect.top + rect.height / 2),
  }
}

async function scrollActiveThumb() {
  await nextTick()
  dialogRef.value
    ?.querySelector<HTMLElement>('.content-lightbox__thumb.is-active')
    ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

function syncPreviewParam(key?: string) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (key) url.searchParams.set('preview', key)
  else url.searchParams.delete('preview')
  window.history.replaceState(window.history.state, '', url.toString())
}

function clearPreviewParam(key?: string) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (url.searchParams.get('preview') !== key) return
  url.searchParams.delete('preview')
  window.history.replaceState(window.history.state, '', url.toString())
}

function openAt(list: PreviewItem[], index: number) {
  items.value = list
  activeIndex.value = index
  opened.value = true
  resetZoom()
  lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  lockScroll()
  syncPreviewParam(list[index]?.key)

  void nextTick(() => {
    closeButton.value?.focus()
    void scrollActiveThumb()
  })
}

function close() {
  if (!opened.value) return

  // 先去掉深链参数，再让元素走 0.3s 的离场动画；DOM 清理放到 after-leave
  clearPreviewParam(current.value?.key)
  opened.value = false
}

function finishClose() {
  // 离场过程中又被打开时，Transition 会取消离场，不能把新状态清掉
  if (opened.value) return

  unlockScroll()
  resetZoom()
  lastFocused?.focus()
  lastFocused = null
  items.value = []
}

function go(index: number) {
  const length = items.value.length
  if (!length) return

  activeIndex.value = (index + length) % length
  syncPreviewParam(items.value[activeIndex.value]?.key)
}

function prev() {
  go(activeIndex.value - 1)
}

function next() {
  go(activeIndex.value + 1)
}

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.content-lightbox')) return
  // 链接里的图片保持原有跳转行为
  if (target.closest('a')) return

  const mermaid = target.closest<HTMLElement>('.mermaid-diagram')
  const image = target.closest<HTMLImageElement>('img')
  const clicked = mermaid ?? image
  if (!clicked) return

  const root = clicked.closest<HTMLElement>('.post-body')
  if (!root) return

  const list = collectItems(root)
  const index = list.findIndex((item) => item.el === clicked || item.el.contains(clicked))
  if (index < 0) return

  event.preventDefault()
  openAt(list, index)
}

function onWheel(event: WheelEvent) {
  if (!(event.target instanceof Element) || !event.target.closest('.content-lightbox__main')) return

  event.preventDefault()
  setScale(scale.value * Math.exp(-event.deltaY * 0.0015), getFocal(event.clientX, event.clientY))
}

function onDoubleClick(event: MouseEvent) {
  if (!(event.target instanceof Element) || !event.target.closest('.content-lightbox__main')) return

  if (scale.value > 1) {
    resetZoom()
    return
  }
  setScale(2, getFocal(event.clientX, event.clientY))
}

const pointers = new Map<number, { x: number; y: number }>()
let panStart = { x: 0, y: 0, offsetX: 0, offsetY: 0 }
let pinchStart = { distance: 0, scale: 1, offsetX: 0, offsetY: 0, midX: 0, midY: 0 }

function startPinch() {
  const [a, b] = [...pointers.values()]
  const main = mainRef.value
  if (!a || !b || !main) return

  const rect = main.getBoundingClientRect()
  pinchStart = {
    distance: Math.hypot(a.x - b.x, a.y - b.y),
    scale: scale.value,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
    midX: (a.x + b.x) / 2 - (rect.left + rect.width / 2),
    midY: (a.y + b.y) / 2 - (rect.top + rect.height / 2),
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  const el = event.currentTarget
  if (el instanceof HTMLElement) el.setPointerCapture(event.pointerId)

  if (pointers.size === 1) {
    if (scale.value <= 1) return
    dragging.value = true
    panStart = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offsetX.value,
      offsetY: offsetY.value,
    }
  } else if (pointers.size === 2) {
    dragging.value = false
    startPinch()
  }
}

function onPointerMove(event: PointerEvent) {
  if (!pointers.has(event.pointerId)) return

  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    if (!a || !b || pinchStart.distance === 0) return

    const nextScale = clamp(
      pinchStart.scale * (Math.hypot(a.x - b.x, a.y - b.y) / pinchStart.distance),
      MIN_SCALE,
      MAX_SCALE,
    )
    const ratio = nextScale / pinchStart.scale
    scale.value = nextScale
    offsetX.value = pinchStart.midX - (pinchStart.midX - pinchStart.offsetX) * ratio
    offsetY.value = pinchStart.midY - (pinchStart.midY - pinchStart.offsetY) * ratio
    clampOffsets()
    return
  }

  if (!dragging.value) return

  offsetX.value = panStart.offsetX + event.clientX - panStart.x
  offsetY.value = panStart.offsetY + event.clientY - panStart.y
  clampOffsets()
}

function onPointerUp(event: PointerEvent) {
  pointers.delete(event.pointerId)
  const el = event.currentTarget
  if (el instanceof HTMLElement && el.hasPointerCapture(event.pointerId)) {
    el.releasePointerCapture(event.pointerId)
  }

  if (pointers.size < 2) pinchStart.distance = 0

  if (pointers.size === 1) {
    const [point] = [...pointers.values()]
    if (point && scale.value > 1) {
      dragging.value = true
      panStart = {
        x: point.x,
        y: point.y,
        offsetX: offsetX.value,
        offsetY: offsetY.value,
      }
    }
  } else if (pointers.size === 0) {
    dragging.value = false
  }
}

const mediaHandlers = {
  pointerdown: onPointerDown,
  pointermove: onPointerMove,
  pointerup: onPointerUp,
  pointercancel: onPointerUp,
}

function trapFocus(event: KeyboardEvent) {
  const root = dialogRef.value
  if (!root) return

  const focusables = Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  )
  if (!focusables.length) return

  const first = focusables[0]!
  const last = focusables[focusables.length - 1]!
  const active = document.activeElement

  if (event.shiftKey && (active === first || !root.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!opened.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
    return
  }

  // 带修饰键时留给浏览器（Ctrl/Cmd +/-/0 是页面缩放）
  const plainKey = !event.ctrlKey && !event.metaKey && !event.altKey

  if (plainKey && (event.key === '+' || event.key === '=')) {
    event.preventDefault()
    zoomIn()
    return
  }

  if (plainKey && (event.key === '-' || event.key === '_')) {
    event.preventDefault()
    zoomOut()
    return
  }

  if (plainKey && event.key === '0') {
    event.preventDefault()
    resetZoom()
    return
  }

  if (event.key === 'Tab') trapFocus(event)
}

function openFromQuery(attempt = 0) {
  if (opened.value) return

  const key = new URLSearchParams(window.location.search).get('preview')
  if (!key) return

  const root = document.querySelector<HTMLElement>('.post-body')
  if (!root) return

  const list = collectItems(root)
  const index = list.findIndex((item) => item.key === key)
  if (index >= 0) {
    list[index]?.el.scrollIntoView({ block: 'center' })
    openAt(list, index)
    return
  }

  // Mermaid 是懒渲染的：把占位元素滚进视口触发渲染，再重试等它变成 SVG
  const placeholder = Array.from(document.querySelectorAll<HTMLElement>('[data-preview-key]')).find(
    (element) => element.dataset.previewKey === key,
  )
  placeholder?.scrollIntoView({ block: 'center' })

  if (attempt < 5) {
    queryTimer = window.setTimeout(() => openFromQuery(attempt + 1), 500)
  }
}

watch(activeIndex, () => {
  resetZoom()
  void scrollActiveThumb()
})

// 布局会跨路由复用，切页时把预览关掉，避免遮罩和旧图片留在新页面上；
// 如果新地址带 ?preview=，等内容渲染出来后再尝试打开
const route = useRoute()
watch(
  () => route.fullPath,
  async () => {
    if (queryTimer) {
      window.clearTimeout(queryTimer)
      queryTimer = undefined
    }
    close()
    await nextTick()
    openFromQuery()
  },
)

onMounted(() => {
  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeydown)
  void nextTick(() => openFromQuery())
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClick)
  document.removeEventListener('keydown', onKeydown)
  if (queryTimer) window.clearTimeout(queryTimer)
  unlockScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="content-lightbox-fade" @after-leave="finishClose">
      <div
        v-if="opened && current"
        ref="dialog"
        class="content-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="图片与图表预览"
      >
        <div
          class="content-lightbox__stage"
          @click.self="close"
          @wheel="onWheel"
          @dblclick="onDoubleClick"
        >
          <p class="content-lightbox__counter" aria-live="polite">{{ counter }}</p>

          <button
            ref="closeButton"
            type="button"
            class="content-lightbox__close"
            aria-label="关闭预览"
            @click="close"
          >
            <span class="i-tabler-x" aria-hidden="true" />
          </button>

          <button
            v-if="items.length > 1"
            type="button"
            class="content-lightbox__nav content-lightbox__nav--prev"
            aria-label="上一张"
            @click="prev"
          >
            <span class="i-tabler-chevron-left" aria-hidden="true" />
          </button>

          <div ref="main" class="content-lightbox__main">
            <img
              v-if="currentImage"
              ref="media"
              :key="currentImage.src"
              :src="currentImage.src"
              :alt="currentImage.alt"
              :style="mediaStyle"
              :class="{ 'is-dragging': dragging }"
              draggable="false"
              v-on="mediaHandlers"
              @load="clampOffsets"
            />
            <div
              v-else-if="currentMermaid"
              ref="media"
              class="content-lightbox__mermaid"
              :class="{ 'is-dragging': dragging }"
              :style="mediaStyle"
              v-html="currentMermaid.svg"
              v-on="mediaHandlers"
            />
          </div>

          <button
            v-if="items.length > 1"
            type="button"
            class="content-lightbox__nav content-lightbox__nav--next"
            aria-label="下一张"
            @click="next"
          >
            <span class="i-tabler-chevron-right" aria-hidden="true" />
          </button>

          <div class="content-lightbox__zoom" role="group" aria-label="缩放">
            <button type="button" aria-label="缩小" @click="zoomOut">−</button>
            <button type="button" aria-label="重置缩放" @click="resetZoom">
              {{ Math.round(scale * 100) }}%
            </button>
            <button type="button" aria-label="放大" @click="zoomIn">+</button>
          </div>
        </div>

        <div
          v-if="items.length > 1"
          class="content-lightbox__thumbs"
          role="group"
          aria-label="文章图片"
        >
          <button
            v-for="(item, index) in items"
            :key="index"
            type="button"
            class="content-lightbox__thumb"
            :class="{ 'is-active': index === activeIndex }"
            :aria-current="index === activeIndex ? 'true' : undefined"
            :aria-label="`查看第 ${index + 1} 张`"
            @click="go(index)"
          >
            <img v-if="item.type === 'image'" :src="item.src" alt="" loading="lazy" />
            <span v-else class="content-lightbox__thumb-mermaid" v-html="item.svg" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.content-lightbox-fade-enter-active,
.content-lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.content-lightbox-fade-enter-from,
.content-lightbox-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .content-lightbox-fade-enter-active,
  .content-lightbox-fade-leave-active {
    transition: none;
  }
}

.content-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: rgb(0 0 0 / 88%);
  color: #fff;
  overscroll-behavior: contain;
}

.content-lightbox__stage {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 3.5rem 4rem 1rem;
  overflow: hidden;

  @media (max-width: 767.9px) {
    padding: 3rem 1rem 0.5rem;
  }
}

.content-lightbox__main {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  pointer-events: none;

  > img,
  > .content-lightbox__mermaid {
    pointer-events: auto;
    touch-action: none;
    transition: transform 0.2s ease-out;
    will-change: transform;
  }

  > img.is-dragging,
  > .content-lightbox__mermaid.is-dragging {
    transition: none;
  }

  > img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 0.25rem;
    user-select: none;
  }
}

.content-lightbox__mermaid {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  background: var(--c-bg);
  color: var(--c-text-1);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }

  :deep(p) {
    margin: 0;
  }
}

.content-lightbox__close,
.content-lightbox__nav {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 12%);
  color: #fff;
  font-size: 1.25rem;
  transition: background-color 0.2s;

  &:hover {
    background: rgb(255 255 255 / 22%);
  }

  &:focus-visible {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  @media (max-width: 767.9px) {
    width: 2rem;
    height: 2rem;
  }
}

.content-lightbox__close {
  top: 1rem;
  inset-inline-end: 1rem;
}

.content-lightbox__nav {
  top: 50%;
  transform: translateY(-50%);

  &--prev {
    inset-inline-start: 1rem;
  }

  &--next {
    inset-inline-end: 1rem;
  }
}

.content-lightbox__counter {
  position: absolute;
  top: 1rem;
  inset-inline-start: 1rem;
  margin: 0;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 35%);
  color: rgb(255 255 255 / 80%);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

.content-lightbox__zoom {
  position: absolute;
  inset-inline-end: 1rem;
  bottom: 1rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 45%);

  > button {
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    border-radius: 999px;
    color: #fff;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    transition: background-color 0.2s;

    &:hover {
      background: rgb(255 255 255 / 15%);
    }

    &:focus-visible {
      outline: 2px solid var(--c-primary);
      outline-offset: 2px;
    }
  }
}

.content-lightbox__thumbs {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  background: rgb(0 0 0 / 30%);
  overscroll-behavior-x: contain;
  scrollbar-color: rgb(255 255 255 / 30%) transparent;
  scrollbar-width: thin;
  touch-action: pan-x;
}

.content-lightbox__thumb {
  flex: 0 0 auto;
  width: 5rem;
  height: 3.75rem;
  padding: 0;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 0.375rem;
  background: rgb(255 255 255 / 8%);
  opacity: 0.55;
  cursor: pointer;
  transition:
    opacity 0.2s,
    border-color 0.2s;

  &.is-active {
    border-color: var(--c-primary);
    opacity: 1;
  }

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
  }

  > img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 767.9px) {
    width: 4rem;
    height: 3rem;
  }
}

.content-lightbox__thumb-mermaid {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 2px;
  background: var(--c-bg);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(p) {
    margin: 0;
  }
}
</style>
