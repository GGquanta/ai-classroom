<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { IconUser, IconCalendar, IconChevronRight, IconCopy, IconDownload, IconStar, IconStarFilled } from '@tabler/icons-vue'
import { useArticles, formatDate, normalizeColor, getArticleCover, getAuthorAvatar } from '../composables/useArticles'
import { useArticleAccess } from '../composables/useArticleAccess'
import { useFavorites } from '../composables/useFavorites'
import {
  fetchArticleBody,
  buildPrompt,
  buildSkillZip,
  copyToClipboard,
  downloadBlob,
} from '../composables/useArticleExport'

const { page, frontmatter } = useData()
const { getByLink } = useArticles()
const { isProtectedArticle, isUnlocked } = useArticleAccess()
const { isFavorite, toggle } = useFavorites()

const article = computed(() => getByLink(page.value.relativePath))
const isProtected = computed(() => !!article.value && isProtectedArticle(article.value))
const canExport = computed(() => !isProtected.value || isUnlocked.value)

const categoryColor = computed(() =>
  article.value ? normalizeColor(article.value.categoryColor) : '#0b5cab',
)

const coverSrc = computed(() => (article.value ? getArticleCover(article.value) : ''))

const authorAvatar = computed(() =>
  article.value ? getAuthorAvatar(article.value.author) : null,
)

const favorited = computed(() => (article.value ? isFavorite(article.value.id) : false))

function handleToggleFavorite() {
  if (!article.value) return
  toggle(article.value.id)
}

const copying = ref(false)
const copied = ref(false)
const downloading = ref(false)
const actionError = ref('')

let copiedTimer: ReturnType<typeof setTimeout> | undefined

async function handleCopyPrompt() {
  if (!article.value || copying.value) return
  copying.value = true
  actionError.value = ''
  try {
    const body = await fetchArticleBody(article.value)
    const prompt = buildPrompt(article.value, body)
    await copyToClipboard(prompt)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : '复制失败'
  } finally {
    copying.value = false
  }
}

async function handleDownloadSkill() {
  if (!article.value || downloading.value) return
  downloading.value = true
  actionError.value = ''
  try {
    const body = await fetchArticleBody(article.value)
    const blob = await buildSkillZip(article.value, body)
    downloadBlob(blob, `${article.value.slug}-skill.zip`)
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : '下载失败'
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <header v-if="article" class="article-hero">
    <div class="article-hero-wrap">
      <div class="article-hero-text">
        <p v-if="actionError" class="article-hero-error" role="alert">{{ actionError }}</p>

        <div class="article-hero-intro">
          <nav class="article-breadcrumb" aria-label="面包屑">
            <a href="/explore">探索</a>
            <IconChevronRight :size="14" :stroke="2" class="breadcrumb-icon" aria-hidden="true" />
            <a :href="`/explore?category=${article.category}`">{{ article.categoryLabel }}</a>
          </nav>

          <div class="article-hero-intro-row">
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

            <button
              type="button"
              class="hero-favorite-btn"
              :class="{ 'is-active': favorited }"
              :aria-pressed="favorited"
              :aria-label="favorited ? '取消收藏' : '收藏文章'"
              @click="handleToggleFavorite"
            >
              <IconStarFilled v-if="favorited" :size="16" :stroke="0" aria-hidden="true" />
              <IconStar v-else :size="16" :stroke="1.75" aria-hidden="true" />
              <span>{{ favorited ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
        </div>

        <div class="article-hero-title-band">
          <h1 class="article-hero-title">{{ frontmatter.title ?? article.title }}</h1>
          <div class="article-hero-actions" role="group" aria-label="文章导出">
            <button
              v-if="canExport"
              type="button"
              class="btn article-hero-btn article-hero-btn-copy"
              :disabled="copying || downloading"
              @click="handleCopyPrompt"
            >
              <IconCopy :size="16" :stroke="2" aria-hidden="true" />
              {{ copied ? '已复制' : copying ? '复制中…' : '复制为提示词' }}
            </button>
            <button
              v-if="canExport"
              type="button"
              class="btn article-hero-btn article-hero-btn-skill"
              :disabled="copying || downloading"
              @click="handleDownloadSkill"
            >
              <IconDownload :size="16" :stroke="2" aria-hidden="true" />
              {{ downloading ? '打包中…' : '下载 SKILL' }}
            </button>
          </div>
        </div>

        <div class="article-hero-details">
          <p class="article-hero-lead">{{ frontmatter.description ?? article.description }}</p>

          <div class="article-hero-meta">
            <div class="meta-author-block">
              <span class="meta-avatar" aria-hidden="true">
                <img
                  v-if="authorAvatar"
                  :src="authorAvatar"
                  :alt="article.author"
                  class="meta-avatar-img"
                />
                <IconUser v-else :size="20" :stroke="1.75" />
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
      </div>

      <figure class="article-hero-figure" :class="{ 'is-protected': isProtected && !isUnlocked }">
        <img :src="coverSrc" :alt="article.title" />
      </figure>
    </div>
  </header>
</template>
