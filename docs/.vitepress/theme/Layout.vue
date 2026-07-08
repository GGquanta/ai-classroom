<script setup lang="ts">
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import MoocHome from './components/MoocHome.vue'
import ArticlesExplore from './components/ArticlesExplore.vue'
import ArticleHero from './components/ArticleHero.vue'
import RelatedArticles from './components/RelatedArticles.vue'
import MoocHeader from './components/MoocHeader.vue'
import { useArticleEnter } from './composables/useArticleEnter'

const { frontmatter, page } = useData()

/** VitePress 会将未知 layout 值当作动态组件名；`article` 会渲染为空的 HTML article 标签 */
const isArticlePage = computed(() =>
  page.value.relativePath.replace(/\.html$/, '').startsWith('articles/'),
)

const { enterActive } = useArticleEnter(isArticlePage)
</script>

<template>
  <MoocHome v-if="frontmatter.layout === 'mooc-home'" />
  <ArticlesExplore v-else-if="frontmatter.layout === 'articles-explore'" />
  <div
    v-else
    class="site-shell"
    :class="{ 'is-article': isArticlePage, 'article-enter': enterActive && isArticlePage }"
  >
    <MoocHeader />
    <DefaultTheme.Layout>
      <template v-if="isArticlePage" #doc-top>
        <ArticleHero />
      </template>
      <template v-if="isArticlePage" #doc-after>
        <RelatedArticles />
      </template>
    </DefaultTheme.Layout>
  </div>
</template>
