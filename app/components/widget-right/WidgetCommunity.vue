<script setup lang="ts">
import type { CommunityCard } from '@/site.config'

const props = defineProps<{ card: CommunityCard }>()
</script>

<template>
  <WidgetCard card dim bg-aside :bg-img="props.card.bgImg || undefined">
    <div class="headline">
      {{ props.card.headline }}
    </div>

    <a v-if="props.card.url" class="entry" :href="props.card.url" rel="noreferrer" target="_blank">
      <span :class="props.card.icon" class="entry-icon" />
      <span>{{ props.card.label }}</span>
    </a>

    <WidgetTip v-else class="entry" copy icon>
      <span :class="props.card.icon" class="entry-icon" />
      <span>{{ props.card.label }}</span>
    </WidgetTip>
  </WidgetCard>
</template>

<style lang="scss" scoped>
.widget {
  --widget-dim-opacity: 0.8;
}

.headline {
  background-clip: text;
  background-image: linear-gradient(60deg, rgb(73, 160, 232), var(--c-primary), var(--c-text-1));
  background-position: 100% 0;
  background-size: 200%;
  font-size: 1.4em;
  color: transparent;
  transition: background-position 0.2s;

  .widget:hover & {
    background-position: 0 0;
  }
}

.entry {
  font-size: 0.9em;
  line-height: 2;

  &:hover {
    color: var(--c-primary);
  }
}

a.entry {
  color: inherit;
  text-decoration: underline dashed var(--c-text-3);
  text-underline-offset: 4px;
  transition: color 0.2s;
}

.entry-icon {
  font-size: 1.2em;
  vertical-align: middle;
}

:deep(.widget-body.with-bg > .bg-img.bg-img) {
  opacity: 0.5;
}
</style>
