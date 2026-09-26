<script setup lang="ts">
withDefaults(
  defineProps<{
    name?: string
  }>(),
  { name: '' },
)

const expanded = defineModel<boolean>({ default: false })
</script>

<template>
  <div class="flex flex-col">
    <div
      class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
      :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :aria-hidden="!expanded"
    >
      <div class="overflow-hidden">
        <slot />
      </div>
    </div>

    <button
      type="button"
      class="mx-auto flex w-fit items-center gap-1 p-[0.3em] text-[0.9em] text-[var(--c-text-2)] transition-colors hover:text-[var(--c-text-1)]"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span
        class="i-tabler-chevrons-down transition-transform duration-200"
        :class="expanded ? 'rotate-180' : undefined"
      />
      <span>{{ `${expanded ? '收起' : '展开'}${name}` }}</span>
    </button>
  </div>
</template>
