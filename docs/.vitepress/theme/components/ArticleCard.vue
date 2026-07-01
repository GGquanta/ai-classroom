<script setup lang="ts">
import { useRoute } from 'vitepress'
import type { Article } from '../composables/useArticles'
import { formatDate, categoryGradient } from '../composables/useArticles'

defineProps<{
  article: Article
}>()

const route = useRoute()
</script>

<template>
  <a :href="article.link" class="article-card" :class="{ 'is-active': route.path === article.link }">
    <div class="card-cover">
      <img v-if="article.cover" :src="article.cover" :alt="article.title" loading="lazy" />
      <div v-else class="cover-placeholder" :style="{ background: categoryGradient(article.categoryColor) }">
        <span>{{ article.categoryLabel.charAt(0) }}</span>
      </div>
      <span class="card-badge" :style="{ backgroundColor: article.categoryColor }">
        {{ article.categoryLabel }}
      </span>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ article.title }}</h3>
      <p class="card-desc">{{ article.description }}</p>
      <div class="card-meta">
        <span class="meta-author">{{ article.author }}</span>
        <span class="meta-dot">·</span>
        <time :datetime="article.date">{{ formatDate(article.date) }}</time>
      </div>
    </div>
  </a>
</template>
