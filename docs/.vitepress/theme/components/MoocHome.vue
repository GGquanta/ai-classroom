<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconChevronRight } from '@tabler/icons-vue'
import MoocHeader from './MoocHeader.vue'
import MoocFooter from './MoocFooter.vue'
import ArticleGrid from './ArticleGrid.vue'
import CategoryIcon from './CategoryIcon.vue'
import { useArticles } from '../composables/useArticles'
import type { Article } from '../composables/useArticles'

const { categories, recent, random } = useArticles()
const featuredArticles = ref<Article[]>(recent(4))

onMounted(() => {
  featuredArticles.value = random(4)
})
</script>

<template>
  <div class="mooc-page">
    <MoocHeader />

    <section class="hero hero-editorial">
      <img
        class="hero-bg"
        src="/hero/home-hero-bg.jpg"
        alt=""
        width="1920"
        height="1280"
        fetchpriority="high"
        decoding="async"
        aria-hidden="true"
      />
      <div class="hero-overlay" aria-hidden="true" />
      <div class="hero-inner fade-in">
        <p class="hero-eyebrow">团队知识库 · 持续更新</p>
        <h1 class="hero-title">AI 协同办公与开发<br />实战经验课堂</h1>
        <p class="hero-subtitle">
          汇集 AI 工具、协同流程、Prompt 模板与项目案例，系统学习、随时查阅。
        </p>
        <div class="hero-actions">
          <a href="/explore" class="btn btn-primary">浏览全部内容</a>
          <a href="/guide/contributing" class="btn btn-secondary">参与投稿</a>
        </div>
      </div>
      <p class="hero-photo-credit">
        Photo by
        <a href="https://unsplash.com/photos/dFohf_GUZJ0" target="_blank" rel="noopener">Y Kang</a>
        on
        <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a>
      </p>
    </section>

    <section class="section section-featured">
      <div class="section-inner fade-in">
        <div class="section-head">
          <div>
            <h2>精选内容</h2>
            <p>每次访问随机推荐的 AI 协同经验</p>
          </div>
          <a href="/explore" class="section-more">
            查看全部
            <IconChevronRight :size="16" :stroke="2" aria-hidden="true" />
          </a>
        </div>
        <ArticleGrid :articles="featuredArticles" empty-text="暂无文章，欢迎投稿" />
      </div>
    </section>

    <section class="section section-topics">
      <div class="section-inner fade-in">
        <div class="section-head section-head-center">
          <h2>按主题探索</h2>
          <p>选择你感兴趣的方向，深入学习</p>
        </div>
        <div class="topic-strip">
          <a
            v-for="cat in categories"
            :key="cat.id"
            :href="`/explore?category=${cat.id}`"
            class="topic-card"
            :style="{ '--cat-color': cat.color ?? '#0b5cab' }"
          >
            <span class="topic-icon">
              <CategoryIcon :category-id="cat.id" :size="22" />
            </span>
            <div class="topic-body">
              <h3>{{ cat.label }}</h3>
              <p>{{ cat.description }}</p>
            </div>
            <IconChevronRight class="topic-arrow" :size="20" :stroke="1.75" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>

    <MoocFooter />
  </div>
</template>
