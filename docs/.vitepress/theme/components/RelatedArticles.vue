<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { IconBooks } from '@tabler/icons-vue'
import ArticleGrid from './ArticleGrid.vue'
import { useArticles } from '../composables/useArticles'

const { page } = useData()
const { getByLink, articles } = useArticles()

const article = computed(() => getByLink(page.value.relativePath))

const related = computed(() => {
  if (!article.value) return []
  return articles.value
    .filter((a) => a.category === article.value!.category && a.id !== article.value!.id)
    .slice(0, 3)
})
</script>

<template>
  <section v-if="related.length" class="related-section">
    <div class="related-inner">
      <h2 class="related-title">
        <IconBooks :size="22" :stroke="1.75" aria-hidden="true" />
        相关阅读
      </h2>
      <ArticleGrid :articles="related" compact />
    </div>
  </section>
</template>
