<script setup lang="ts">
import ArticleCard from './ArticleCard.vue'
import type { Article } from '../composables/useArticles'

defineProps<{
  articles: Article[]
  emptyText?: string
}>()
</script>

<template>
  <div v-if="articles.length" class="article-grid">
    <ArticleCard v-for="item in articles" :key="item.id" :article="item" />
  </div>
  <div v-else class="empty-state">
    <p>{{ emptyText ?? '暂无匹配的文章' }}</p>
  </div>
</template>
