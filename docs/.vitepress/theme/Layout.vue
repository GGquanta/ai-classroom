<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import MoocHome from './components/MoocHome.vue'
import ArticlesExplore from './components/ArticlesExplore.vue'
import ArticleHero from './components/ArticleHero.vue'
import RelatedArticles from './components/RelatedArticles.vue'
import MoocHeader from './components/MoocHeader.vue'

const { frontmatter } = useData()
</script>

<template>
  <MoocHome v-if="frontmatter.layout === 'mooc-home'" />
  <ArticlesExplore v-else-if="frontmatter.layout === 'articles-explore'" />
  <div v-else class="site-shell" :class="{ 'is-article': frontmatter.pageType === 'article' }">
    <MoocHeader />
    <DefaultTheme.Layout>
      <template v-if="frontmatter.pageType === 'article'" #doc-before>
        <ArticleHero />
      </template>
      <template v-if="frontmatter.pageType === 'article'" #doc-after>
        <RelatedArticles />
      </template>
    </DefaultTheme.Layout>
  </div>
</template>
