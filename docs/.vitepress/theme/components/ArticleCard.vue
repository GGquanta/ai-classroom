<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import type { Article } from '../composables/useArticles'
import { formatDate, normalizeColor, getArticleCover } from '../composables/useArticles'

const props = defineProps<{
  article: Article
  compact?: boolean
}>()

const route = useRoute()
const coverSrc = computed(() => getArticleCover(props.article))
</script>

<template>
  <a
    :href="article.link"
    class="article-card"
    :class="{ 'is-active': route.path === article.link, 'is-compact': compact }"
  >
    <div class="card-cover">
      <img :src="coverSrc" :alt="article.title" loading="lazy" />
    </div>
    <div class="card-body">
      <span class="card-category" :style="{ color: normalizeColor(article.categoryColor) }">
        {{ article.categoryLabel }}
      </span>
      <h3 class="card-title">{{ article.title }}</h3>
      <p v-if="!compact" class="card-desc">{{ article.description }}</p>
      <div class="card-meta">
        <span class="meta-author">{{ article.author }}</span>
        <span class="meta-dot">·</span>
        <time :datetime="article.date">{{ formatDate(article.date) }}</time>
      </div>
    </div>
  </a>
</template>
