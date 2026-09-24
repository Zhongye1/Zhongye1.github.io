<script setup lang="ts">
// 友链页：好友站点网格 + 本站信息（可复制）+ 申请流程。
// 数据全在 `app/friends.config.ts`，这里只负责排序、过滤与渲染。
import { applySteps, friends, mySite } from '@/friends.config'

useSeoMeta({
  title: '友链',
  description: `${mySite.name}的友链页面，收集了朋友们的站点。`,
})

/**
 * 上墙的友链：先按 `enabled` 过滤，再按 `weight` 降序。
 * 同权重用 title 兜底排序，免得依赖配置文件里的书写顺序 —— 那种顺序一改配置就乱。
 */
const list = computed(() =>
  friends
    .filter((friend) => friend.enabled)
    .toSorted((a, b) => b.weight - a.weight || a.title.localeCompare(b.title)),
)

// 图挂了就退回首字母兜底：友链的头像多半挂在别人服务器上，失效是常态
const brokenImages = ref(new Set<string>())

function hasAvatar(friend: (typeof friends)[number]) {
  return Boolean(friend.imgurl) && !brokenImages.value.has(friend.imgurl)
}

function markBroken(friend: (typeof friends)[number]) {
  brokenImages.value = new Set(brokenImages.value).add(friend.imgurl)
}

/** 本站信息卡的字段，值直接取自 friends.config */
const siteFields = [
  { label: '站点名称', value: mySite.name },
  { label: '站点描述', value: mySite.desc },
  { label: '站点链接', value: mySite.url },
  { label: '头像链接', value: mySite.avatar },
]

/** 刚刚复制成功的那一项，1.5s 后清掉，用来把图标换成对勾 */
const justCopied = ref('')

function copyField(value: string) {
  // navigator.clipboard 只在安全上下文（https / localhost）可用，老浏览器直接静默跳过
  if (!import.meta.client || !navigator.clipboard) return

  navigator.clipboard
    .writeText(value)
    .then(() => {
      justCopied.value = value
      setTimeout(() => {
        if (justCopied.value === value) justCopied.value = ''
      }, 1500)
    })
    .catch(() => {})
}
</script>

<template>
  <section class="flex flex-col gap-8">
    <header class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold">友链</h1>
      <p class="color-fade text-sm">{{ mySite.desc }}</p>
    </header>

    <!-- 好友站点 -->
    <ul v-if="list.length" class="friend-grid">
      <li v-for="friend in list" :key="friend.siteurl || friend.title">
        <a
          class="friend-card"
          :href="friend.siteurl"
          :title="friend.desc || friend.title"
          rel="noreferrer"
          target="_blank"
        >
          <img
            v-if="hasAvatar(friend)"
            class="friend-avatar"
            :src="friend.imgurl"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(friend)"
          />
          <span v-else class="friend-avatar friend-avatar-fallback">
            {{ friend.title.slice(0, 1) }}
          </span>

          <span class="friend-text">
            <span class="friend-name">{{ friend.title }}</span>
            <span v-if="friend.desc" class="friend-desc">{{ friend.desc }}</span>
          </span>

          <span v-if="friend.tags.length" class="friend-tags">
            <span v-for="tag in friend.tags" :key="tag">{{ tag }}</span>
          </span>
        </a>
      </li>
    </ul>

    <p v-else class="color-fade rounded-lg bg-[var(--c-bg-1)] px-4 py-6 text-center text-sm">
      blank
    </p>

    <!-- 朋友们的坐标：点阵地球 / 平面地图，滚动到视口内才跑渲染循环 -->
    <FriendsMap />
    <!-- 本站信息 + 申请流程 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-4 rounded-2xl bg-[var(--c-bg-1)] p-5">
        <div class="flex items-center gap-4">
          <img
            class="size-16 shrink-0 rounded-xl object-cover"
            :src="mySite.avatar"
            alt=""
            referrerpolicy="no-referrer"
          />
          <div class="min-w-0">
            <p class="font-bold">{{ mySite.name }}</p>
            <p class="color-fade text-xs">{{ mySite.desc }}</p>
          </div>
        </div>

        <ul class="flex flex-col gap-2">
          <li
            v-for="field in siteFields"
            :key="field.label"
            class="flex items-center gap-2 rounded-lg bg-[var(--c-bg-2)] px-3 py-2"
          >
            <span class="min-w-0 flex-1">
              <span class="color-fade block text-[0.65rem]">{{ field.label }}</span>
              <span class="block truncate text-xs">{{ field.value }}</span>
            </span>

            <button
              type="button"
              class="shrink-0 cursor-pointer rounded-md p-1.5 text-[var(--c-text-2)] transition-colors hover:bg-[var(--c-bg-3)] hover:text-[var(--c-text-1)]"
              :aria-label="`复制${field.label}`"
              @click="copyField(field.value)"
            >
              <span
                :class="
                  justCopied === field.value
                    ? 'i-tabler-check text-[var(--c-success)]'
                    : 'i-tabler-copy'
                "
              />
            </button>
          </li>
        </ul>
      </div>

      <ol class="flex flex-col gap-4 rounded-2xl bg-[var(--c-bg-1)] p-5">
        <li v-for="(step, index) in applySteps" :key="step.title" class="flex gap-3">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--c-primary-soft)] text-xs font-bold text-[var(--c-primary)]"
          >
            {{ index + 1 }}
          </span>
          <span class="flex flex-col gap-1">
            <span class="text-sm font-semibold">{{ step.title }}</span>
            <span class="color-fade text-xs leading-relaxed">{{ step.content }}</span>
          </span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.friend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.8rem;
}

// 与文章卡片同一套底：浅色下比页面稍灰、深色下比页面更亮（见 color.scss 的 --ld-bg-card）
.friend-card {
  contain: paint;
  display: flex;
  align-items: center;
  gap: 0.8em;
  padding: 0.8em;
  border-radius: 0.8em;
  background-color: var(--ld-bg-card);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--c-bg-2);

    .friend-name {
      color: var(--c-primary);
    }
  }
}

.friend-avatar {
  width: 2.8em;
  height: 2.8em;
  flex-shrink: 0;
  border-radius: 0.6em;
  object-fit: cover;
}

// 图挂了就拿站名首字顶上：友链头像多半挂在别人服务器上，失效是常态
.friend-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-2);
  background-color: var(--c-bg-2);
  font-size: 1.2em;
  font-weight: 600;
  line-height: 1;
}

.friend-text {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  min-width: 0;
}

.friend-name {
  color: var(--c-text-1);
  font-weight: 600;
  transition: color 0.2s;
}

// 介绍压到两行：友链的 desc 长短差得很远，高矮不一会让整片网格看起来歪
.friend-desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  color: var(--c-text-2);
  font-size: 0.8em;
  line-height: 1.5;
}

.friend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3em;
  margin-inline-start: auto;
  font-size: 0.7em;
  color: var(--c-text-3);
}
</style>
