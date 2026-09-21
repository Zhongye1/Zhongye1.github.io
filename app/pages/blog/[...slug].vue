<script setup lang="ts">
const route = useRoute()

const slug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param.join('/') : param
})

const { data: doc } = await useAsyncData('hello-doc', () =>
  queryCollection('content').path('/hello').first(),
)
</script>

<template>
  <section>
    <p>{{ slug }}</p>
    <ContentRenderer v-if="doc" :value="doc" />
  </section>
</template>
