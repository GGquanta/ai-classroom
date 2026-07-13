<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import VPLink from 'vitepress/dist/client/theme-default/components/VPLink.vue'
import { IconShare2 } from '@tabler/icons-vue'
import { useArticles } from '../composables/useArticles'
import { useArticleAccess } from '../composables/useArticleAccess'
import { downloadBlob } from '../composables/useArticleExport'
import { generateArticleShareImage } from '../composables/generateArticleShareImage'

const { page, frontmatter } = useData()
const { getByLink } = useArticles()
const { isProtectedArticle, isUnlocked } = useArticleAccess()

const article = computed(() => getByLink(page.value.relativePath))
const canShare = computed(() => !!article.value && (!isProtectedArticle(article.value) || isUnlocked.value))
const shareTitle = computed(() => (frontmatter.value.title as string | undefined) ?? article.value?.title ?? '')

const previewUrl = ref('')
const loading = ref(false)
const error = ref('')

let previewObjectUrl = ''

const canDownload = computed(() => !!previewUrl.value && !loading.value)

const actionLabel = computed(() => {
  if (loading.value) return '正在生成分享图…'
  return '点击下载分享图'
})

function revokePreviewUrl() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl)
    previewObjectUrl = ''
  }
  previewUrl.value = ''
}

async function generateShareImage() {
  if (!article.value || loading.value) return

  loading.value = true
  error.value = ''
  revokePreviewUrl()

  try {
    const blob = await generateArticleShareImage(article.value, shareTitle.value)
    previewObjectUrl = URL.createObjectURL(blob)
    previewUrl.value = previewObjectUrl
  } catch (err) {
    error.value = err instanceof Error ? err.message : '分享图生成失败'
  } finally {
    loading.value = false
  }
}

function onShareLinkClick(event: MouseEvent) {
  if (!canDownload.value) {
    event.preventDefault()
    return
  }
  event.preventDefault()
  handleDownload()
}

function handleDownload() {
  if (!article.value || !previewUrl.value || loading.value) return
  fetch(previewUrl.value)
    .then((res) => res.blob())
    .then((blob) => downloadBlob(blob, `${article.value!.slug}-share.png`))
    .catch(() => {
      error.value = '下载失败，请重试'
    })
}

onMounted(() => {
  if (canShare.value) {
    void generateShareImage()
  }
})

onBeforeUnmount(() => {
  revokePreviewUrl()
})
</script>

<template>
  <template v-if="canShare && article">
    <div class="article-share-link">
      <VPLink
        class="edit-link-button"
        :href="previewUrl || '#'"
        :no-icon="true"
        :aria-disabled="!canDownload"
        @click="onShareLinkClick"
      >
        <IconShare2 :size="16" :stroke="2" class="edit-link-icon" aria-hidden="true" />
        {{ actionLabel }}
      </VPLink>
    </div>

    <div class="article-share">
      <p v-if="error" class="article-share-error" role="alert">
        {{ error }}
        <button type="button" class="article-share-retry" @click="generateShareImage">重试</button>
      </p>

      <div v-else-if="loading" class="article-share-loading" aria-live="polite">
        <div class="article-share-skeleton" aria-hidden="true" />
      </div>

      <button
        v-else-if="previewUrl"
        type="button"
        class="article-share-preview-btn"
        title="点击下载分享图"
        aria-label="点击下载分享图"
        @click="handleDownload"
      >
        <img
          :src="previewUrl"
          :alt="`${shareTitle} 分享图`"
          class="article-share-preview"
          loading="lazy"
        />
      </button>
    </div>
  </template>
</template>
