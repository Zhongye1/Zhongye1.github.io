<script setup lang="ts">
import { useTaxonomyPage } from '@/composables/useTaxonomyPage'

const { posts, page, path, title, description } = await useTaxonomyPage('tag')

useSeoMeta({ title, description })
</script>

<template>
  <PostListPage :posts="posts" :page="page" :base="path" :title="title" />
</template>
