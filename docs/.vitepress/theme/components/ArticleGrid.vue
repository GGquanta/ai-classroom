<script setup lang="ts">
import { IconBooks } from '@tabler/icons-vue'
import ArticleCard from './ArticleCard.vue'
import type { Article } from '../composables/useArticles'

defineProps<{
  articles: Article[]
  emptyText?: string
  compact?: boolean
}>()
</script>

<template>
  <div v-if="articles.length" class="article-grid" :class="{ 'is-compact': compact }">
    <ArticleCard
      v-for="item in articles"
      :key="item.id"
      :article="item"
      :compact="compact"
    />
  </div>
  <div v-else class="empty-state">
    <IconBooks class="empty-icon" :size="48" :stroke="1.25" aria-hidden="true" />
    <p>{{ emptyText ?? '暂无匹配的文章' }}</p>
    <a href="/guide/contributing" class="empty-link">参与投稿 →</a>
  </div>
</template>
