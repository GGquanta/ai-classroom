<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useArticles, formatDate } from '../composables/useArticles'

const { page, frontmatter } = useData()
const { getByLink } = useArticles()

const article = computed(() => getByLink(page.value.relativePath))
</script>

<template>
  <div v-if="article" class="article-hero-banner">
    <div class="article-hero-inner">
      <a :href="`/explore?category=${article.category}`" class="hero-category" :style="{ color: article.categoryColor }">
        {{ article.categoryLabel }}
      </a>
      <h1>{{ frontmatter.title ?? article.title }}</h1>
      <p class="hero-desc">{{ frontmatter.description ?? article.description }}</p>
      <div class="hero-meta">
        <span class="meta-chip">{{ article.author }}</span>
        <time :datetime="article.date">{{ formatDate(article.date) }}</time>
      </div>
      <div v-if="article.tags?.length" class="hero-tags">
        <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
      </div>
    </div>
    <div v-if="article.cover" class="article-hero-cover">
      <img :src="article.cover" :alt="article.title" />
    </div>
  </div>
</template>
