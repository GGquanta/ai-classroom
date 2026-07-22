<script setup lang="ts">
import { IconLock } from '@tabler/icons-vue'
import type { Article } from '../composables/useArticles'
import { formatDate, getArticleCover } from '../composables/useArticles'

defineProps<{
  articles: Article[]
}>()
</script>

<template>
  <div v-if="articles.length" class="latest-spotlight">
    <a
      v-for="(article, index) in articles"
      :key="article.id"
      :href="article.link"
      class="spotlight-card spotlight-item"
      :class="{ 'is-protected': article.protected }"
      :style="{ '--spotlight-delay': `${index * 90}ms` }"
    >
      <img
        class="spotlight-bg"
        :src="getArticleCover(article)"
        :alt="article.title"
        :loading="index === 0 ? 'eager' : 'lazy'"
        :fetchpriority="index === 0 ? 'high' : undefined"
      />
      <span v-if="index === 0" class="spotlight-badge">最新</span>
      <div class="spotlight-content">
        <div class="spotlight-meta-row">
          <span class="spotlight-category">{{ article.categoryLabel }}</span>
          <span
            v-if="article.protected"
            class="spotlight-lock"
            aria-label="访问受限"
            title="访问受限"
          >
            <IconLock :size="14" :stroke="2" aria-hidden="true" />
          </span>
        </div>
        <h3 class="spotlight-title">{{ article.title }}</h3>
        <p class="spotlight-desc">{{ article.description }}</p>
        <div class="spotlight-byline">
          <span class="spotlight-author">{{ article.author }}</span>
          <span class="spotlight-dot" aria-hidden="true">·</span>
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
        </div>
      </div>
    </a>
  </div>
</template>
