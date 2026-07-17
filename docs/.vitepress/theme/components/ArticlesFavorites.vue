<script setup lang="ts">
import { computed } from 'vue'
import MoocHeader from './MoocHeader.vue'
import MoocFooter from './MoocFooter.vue'
import ArticleGrid from './ArticleGrid.vue'
import { useFavorites } from '../composables/useFavorites'

const { favoriteArticles } = useFavorites()

const list = computed(() => favoriteArticles.value)
</script>

<template>
  <div class="mooc-page">
    <MoocHeader />

    <section class="page-hero editorial">
      <div class="section-inner fade-in">
        <h1>我的收藏</h1>
        <p>你收藏的文章会保存在本机浏览器中，方便随时回看</p>
      </div>
    </section>

    <section class="section section-explore">
      <div class="section-inner fade-in">
        <div v-if="list.length" class="result-bar">
          <span class="result-count">共 {{ list.length }} 篇</span>
        </div>

        <ArticleGrid
          :articles="list"
          empty-text="还没有收藏任何文章"
          empty-link-href="/explore"
          empty-link-label="去探索文章 →"
        />
      </div>
    </section>

    <MoocFooter />
  </div>
</template>
