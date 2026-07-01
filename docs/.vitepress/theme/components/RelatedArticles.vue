<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
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
  <div v-if="related.length" class="related-articles">
    <h4>同分类推荐</h4>
    <ul>
      <li v-for="item in related" :key="item.id">
        <a :href="item.link">{{ item.title }}</a>
      </li>
    </ul>
  </div>
</template>
