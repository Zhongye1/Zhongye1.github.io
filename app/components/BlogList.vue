<script setup lang="ts">
// 列表视图：标题行 + 文章卡片 + 分页条。
// 数据与页码校验留在页面里（`/` 与 `/page/N` 各自负责自己的越界处理），这里只负责渲染。

import Pagination from '@/components/Pagination.vue'
import SearchButton from '@/components/SearchButton.vue'

interface BlogPost {
  path: string
  title?: string | null
  description?: string | null
  date?: string | null
  published?: string | null
  category?: string | null
  tags?: string[] | null
  cover?: string | null
  words?: number | null
}

const props = withDefaults(
  defineProps<{
    posts: BlogPost[]
    page: number
    totalPages: number
    /** 页面标题，第 2 页起会带上页码 */
    title?: string
    /** 第 1 页路径，透传给 Pagination；首页传 `''` */
    base?: string
  }>(),
  { title: '文章', base: '' },
)
</script>

<template>
  <section class="flex flex-col gap-8">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-bold">{{ props.title }}</h1>

      <SearchButton collapsed label="搜索文章" />
    </div>

    <p v-if="!props.posts.length" class="color-fade">No posts yet.</p>

    <ul v-else>
      <li v-for="post in props.posts" :key="post.path">
        <NuxtLink :to="toBlogPath(post.path)" class="article-card">
          <!--
            alt 留空：宽版封面是右侧浮层、窄版标题就压在图上，标题念一遍就够。
            referrerpolicy 是必须的 —— 封面大多在 zhimg.com，知乎图床按 Referer 防盗链。
          -->
          <img
            v-if="post.cover"
            class="article-cover"
            :src="post.cover"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
          />

          <article>
            <h2 class="article-title">
              {{ post.title }}
            </h2>

            <p v-if="post.description" class="article-description">
              {{ post.description }}
            </p>

            <div class="article-info">
              <time v-if="formatPostDate(post)">
                <span class="i-tabler-pencil-minus" />{{ formatPostDate(post) }}
              </time>

              <span v-if="post.category">
                <span class="i-tabler-folder" />{{ post.category }}
              </span>

              <span v-if="post.words">
                <span class="i-tabler-pilcrow" />{{ formatNumber(post.words) }}字
              </span>

              <span v-for="tag in post.tags ?? []" :key="tag">#{{ tag }}</span>
            </div>
          </article>
        </NuxtLink>
      </li>
    </ul>

    <Pagination :page="props.page" :total-pages="props.totalPages" :base="props.base" sticky />
  </section>
</template>

<style lang="scss" scoped>
$cover-narrow: 528px;

.article-card {
  // contain: paint 不只是省事 —— 没有它，绝对定位的封面会方角溢出圆角卡片
  contain: paint;
  display: block;
  border-radius: 0.8em;
  // box-shadow: var(--box-shadow-1);
  // 卡片底色：浅色下比页面稍灰、深色下比页面更亮，两种模式都立得起来
  background-color: var(--ld-bg-card);
  // transition: all 0.2s;

  // 整卡悬浮（或键盘走到这张卡）时标题变主色 + 下划线从左扫到右，
  // 作为「这里可以点」的反馈。视觉细节见 .article-title::after
  &:hover,
  &:focus-visible {
    // box-shadow: var(--box-shadow-1);
    // transform: translateY(-2px);

    .article-title {
      color: var(--c-primary);

      &::after {
        transform: scaleX(1);
        transform-origin: left;
      }
    }
  }

  container-type: inline-size;
  position: relative;
  margin: 1em 0;
  color: var(--c-text-1);

  > article {
    display: grid;
    gap: 0.5em;
    padding: 1em;
  }
}

.article-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em clamp(1em, 5%, 1.5em);
  font-size: 0.8em;
  color: var(--c-text-2);

  &:empty {
    display: none;
  }

  // 每项都是「图标 + 文字」，统一成 inline-flex 才能对齐
  > * {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
  }
}

.article-title {
  position: relative;
  // 下划线只跟文字一样长：网格项默认撑满整列，靠 justify-self 收回内容宽度
  justify-self: start;
  font-size: 1.2em;
  color: var(--c-text-1);
  // 只过渡颜色：卡片那边没给 transition，标题这一下要是也硬切会很突然
  transition: color 0.2s;

  // 下划线本体。用 transform 扫而不是动 width：只走合成层，也才能指定从哪一端长出来。
  // 默认 origin 在右、悬浮时切到左 —— 进是从左往右长出来，退是继续往右缩回去，
  // 两端同向，看起来像一条线扫过标题。
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

.article-description {
  font-size: 0.9em;
  color: var(--c-text-2);
}

.article-cover {
  position: absolute;
  opacity: 0.8;
  inset-inline-end: 0;
  top: 0;
  // 超出 40%，故意压到正文底下一截
  width: calc(40% + 2em);
  height: 100%;
  margin: 0;
  // 从左侧渐显，让图「融」进卡片底色。
  // 用遮罩而不是叠一层渐变 div：它作用在 alpha 通道上，不依赖底色具体是什么
  mask-image: linear-gradient(to right, transparent, #fff 50%);
  transition: opacity 0.2s;
  object-fit: cover;

  // .article-card:hover > & {
  //   opacity: 1;
  // }

  // 相邻兄弟选择器：正文收窄由「有没有封面」驱动。
  // 没图时这条不匹配，正文自动占满，不需要额外的 :class 判断
  & + article {
    position: relative;
    width: 60%;
  }

  @mixin cover-narrow {
    position: revert;
    width: 100%;
    height: auto;
    max-width: none;
    max-height: 256px;
    // 固定比例：不写它，各种比例的封面会把列表撑得参差不齐
    aspect-ratio: 2.4;
    // 负外边距把正文拉上来压住图片下缘。百分比外边距按包含块「宽度」算，
    // 于是位移始终是宽度的 10%，与 aspect-ratio 撑出的高度成比例，窄宽都成立
    margin-bottom: -10%;
    // 换成竖向渐隐：下半淡出，给压上来的标题留个干净落点
    mask-image: linear-gradient(#fff 50%, transparent);

    & + article {
      width: auto;

      > .article-title {
        // 标题叠在图上，靠一圈卡片底色的光晕保证可读
        text-shadow:
          0 0 0.2em var(--ld-bg-card),
          0 0 0.5em var(--ld-bg-card),
          0 0 1em var(--ld-bg-card);
      }
    }
  }

  // 两条都写不是冗余：@container 是正解（卡片在内容列里，宽度 ≠ 视口），
  // @media 是给不支持容器查询的浏览器兜底
  @media (max-width: #{$cover-narrow}) {
    @include cover-narrow;
  }

  @container (max-width: #{$cover-narrow}) {
    @include cover-narrow;
  }
}
</style>
