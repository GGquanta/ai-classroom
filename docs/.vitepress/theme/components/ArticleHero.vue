<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { IconUser, IconCalendar, IconChevronRight } from '@tabler/icons-vue'
import { useArticles, formatDate, normalizeColor, getArticleCover } from '../composables/useArticles'

const { page, frontmatter } = useData()
const { getByLink } = useArticles()

const article = computed(() => getByLink(page.value.relativePath))

const categoryColor = computed(() =>
  article.value ? normalizeColor(article.value.categoryColor) : '#0b5cab',
)

const coverSrc = computed(() => (article.value ? getArticleCover(article.value) : ''))
</script>

<template>
  <header v-if="article" class="article-hero">
    <div class="article-hero-wrap">
      <div class="article-hero-content">
        <nav class="article-breadcrumb" aria-label="面包屑">
          <a href="/explore">探索</a>
          <IconChevronRight :size="14" :stroke="2" class="breadcrumb-icon" aria-hidden="true" />
          <a :href="`/explore?category=${article.category}`">{{ article.categoryLabel }}</a>
        </nav>

        <a
          :href="`/explore?category=${article.category}`"
          class="hero-category-pill"
          :style="{
            color: categoryColor,
            backgroundColor: `color-mix(in srgb, ${categoryColor} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${categoryColor} 25%, transparent)`,
          }"
        >
          {{ article.categoryLabel }}
        </a>

        <h1 class="article-hero-title">{{ frontmatter.title ?? article.title }}</h1>

        <p class="article-hero-lead">{{ frontmatter.description ?? article.description }}</p>

        <div class="article-hero-meta">
          <div class="meta-author-block">
            <span class="meta-avatar" aria-hidden="true">
              <IconUser :size="20" :stroke="1.75" />
            </span>
            <div>
              <span class="meta-author-name">{{ article.author }}</span>
              <time class="meta-date" :datetime="article.date">
                <IconCalendar :size="13" :stroke="1.75" class="meta-date-icon" aria-hidden="true" />
                {{ formatDate(article.date) }}
              </time>
            </div>
          </div>
          <div v-if="article.tags?.length" class="hero-tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </div>
      </div>

      <figure class="article-hero-figure">
        <img :src="coverSrc" :alt="article.title" />
      </figure>
    </div>
  </header>
</template>
