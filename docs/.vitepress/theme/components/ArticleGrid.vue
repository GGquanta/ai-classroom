<script setup lang="ts">
import { IconBooks } from '@tabler/icons-vue'
import ArticleCard from './ArticleCard.vue'
import type { Article } from '../composables/useArticles'

const {
  articles,
  emptyText,
  emptyLinkHref = '/guide/contributing',
  emptyLinkLabel = '参与投稿 →',
  compact,
} = defineProps<{
  articles: Article[]
  emptyText?: string
  emptyLinkHref?: string
  emptyLinkLabel?: string
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
    <a :href="emptyLinkHref" class="empty-link">{{ emptyLinkLabel }}</a>
  </div>
</template>
