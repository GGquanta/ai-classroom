<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import MoocHeader from './MoocHeader.vue'
import MoocFooter from './MoocFooter.vue'
import ArticleFilters from './ArticleFilters.vue'
import ArticleGrid from './ArticleGrid.vue'
import { useArticles } from '../composables/useArticles'

const { articles, categories, authors } = useArticles()

const category = ref('all')
const author = ref('all')
const sort = ref<'newest' | 'oldest'>('newest')

function readQuery() {
  if (typeof window === 'undefined') return
  const search = new URLSearchParams(window.location.search)
  category.value = search.get('category') ?? 'all'
  author.value = search.get('author') ?? 'all'
  sort.value = (search.get('sort') as 'newest' | 'oldest') ?? 'newest'
}

onMounted(readQuery)

watch([category, author, sort], () => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  if (category.value !== 'all') params.set('category', category.value)
  if (author.value !== 'all') params.set('author', author.value)
  if (sort.value !== 'newest') params.set('sort', sort.value)
  const qs = params.toString()
  const url = qs ? `/explore?${qs}` : '/explore'
  window.history.replaceState(null, '', url)
})

const filtered = computed(() => {
  let list = [...articles.value]
  if (category.value !== 'all') list = list.filter((a) => a.category === category.value)
  if (author.value !== 'all') list = list.filter((a) => a.author === author.value)
  list.sort((a, b) =>
    sort.value === 'newest'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date),
  )
  return list
})
</script>

<template>
  <div class="mooc-page">
    <MoocHeader />

    <section class="page-hero editorial">
      <div class="section-inner fade-in">
        <h1>探索内容</h1>
        <p>按分类、作者与时间筛选，找到你需要的学习资料</p>
      </div>
    </section>

    <section class="section section-explore">
      <div class="section-inner fade-in">
        <ArticleFilters
          v-model:model-category="category"
          v-model:model-author="author"
          v-model:model-sort="sort"
          :categories="categories"
          :authors="authors"
        />

        <div class="result-bar">
          <span class="result-count">共 {{ filtered.length }} 篇</span>
        </div>

        <ArticleGrid :articles="filtered" />
      </div>
    </section>

    <MoocFooter />
  </div>
</template>
