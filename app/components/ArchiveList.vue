<script setup lang="ts">
// 归档视图：按年分组的时间线列表。
import siteConfig from '@/site.config'

interface ArchivePost {
  path: string
  title?: string | null
  date?: string | null
  published?: string | null
  category?: string | null
  tags?: string[] | null
  words?: number | null
}

interface YearGroup {
  year: string
  /** 该年作者几岁；缺出生年时为 null，不显示 */
  age: number | null
  words: number
  posts: number
  /** 组内文章，已按时间倒序 */
  entries: ArchivePost[]
}

const props = defineProps<{ posts: ArchivePost[] }>()

const groups = computed<YearGroup[]>(() => {
  const buckets = new Map<string, YearGroup>()

  for (const post of props.posts) {
    const year = postDate(post).slice(0, 4) || '未知'
    const group = buckets.get(year) ?? {
      year,
      age: siteConfig.birthYear ? Number(year) - siteConfig.birthYear : null,
      words: 0,
      posts: 0,
      entries: [],
    }

    group.words += post.words ?? 0
    group.posts += 1
    group.entries.push(post)
    buckets.set(year, group)
  }

  return [...buckets.values()].toSorted((a, b) => b.year.localeCompare(a.year))
})

/** `2026-07-29 12:00:00` -> `07/29` */
function monthDay(post: ArchivePost) {
  const value = postDate(post)
  return value ? `${value.slice(5, 7)}/${value.slice(8, 10)}` : '--/--'
}
</script>

<template>
  <section class="archive">
    <details v-for="group in groups" :key="group.year" class="archive-year" open>
      <summary class="year-head">
        <span class="year-number">{{ group.year }}</span>

        <span class="year-meta">
          <span v-if="group.age">{{ group.age }}岁</span>
          <span>{{ formatNumber(group.words) }}字</span>
          <span>{{ group.posts }}篇</span>
        </span>
      </summary>

      <ul class="year-posts">
        <li v-for="post in group.entries" :key="post.path">
          <NuxtLink class="archive-item" :to="toBlogPath(post.path)">
            <time class="item-date" :datetime="formatPostDate(post) || undefined">
              {{ monthDay(post) }}
            </time>

            <span class="item-title">{{ post.title }}</span>

            <span v-if="post.tags?.length || post.category" class="item-tags">
              <span v-for="tag in post.tags ?? []" :key="tag">{{ tag }}</span>
              <span v-if="post.category && !post.tags?.includes(post.category)">
                {{ post.category }}
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </details>
  </section>
</template>

<style lang="scss" scoped>
.archive {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}

.year-head {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
  padding-inline-start: 0.6em;
  // 收起来时年份那条也要能点开，marker 之外留出足够的行高
  cursor: pointer;
  border-inline-start: 3px solid var(--c-primary);
  list-style: none;
  user-select: none;

  &::-webkit-details-marker {
    display: none;
  }
}

.year-number {
  color: var(--c-text-1);
  font-size: 1.4em;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.year-meta {
  display: flex;
  align-items: baseline;
  gap: 0.6em;
  color: var(--c-text-3);
  font-size: 0.8em;

  > span + span::before {
    content: '·';
    margin-inline-end: 0.6em;
  }
}

.year-posts {
  display: flex;
  flex-direction: column;
  margin-top: 0.4em;
}

// 日期与标题之间用一根虚线牵着，长标题掉到第二行也还能和日期对上
.archive-item {
  display: grid;
  grid-template-columns: 3.2em 1fr;
  align-items: baseline;
  column-gap: 0.6em;
  padding: 0.35em 0.6em;
  border-radius: 0.4em;
  transition: background-color 0.2s;

  &:hover,
  &:focus-visible {
    background-color: var(--c-bg-soft);

    .item-title {
      color: var(--c-primary);

      &::after {
        transform: scaleX(1);
        transform-origin: left;
      }
    }
  }
}

.item-date {
  color: var(--c-text-3);
  font-size: 0.8em;
  font-variant-numeric: tabular-nums;
}

.item-title {
  position: relative;
  // 下划线只跟文字一样长：网格项默认撑满整列，靠 justify-self 收回内容宽度
  justify-self: start;
  color: var(--c-text-1);
  transition: color 0.2s;

  // 与首页卡片标题同一套：默认 origin 在右、悬浮时切到左，
  // 进从左往右长出来、退继续往右缩回去（细节见 BlogList 的同名规则）
  &::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: -0.15em;
    height: 2px;
    border-radius: 1px;
    background-color: var(--c-primary);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.25s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      transition: none;
    }
  }
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  grid-column: 2;
  margin-top: 0.15em;
  color: var(--c-text-3);
  font-size: 0.75em;

  > span {
    padding: 0.1em 0.5em;
    border-radius: 0.6em;
    background-color: var(--c-bg-2);
  }
}
</style>
