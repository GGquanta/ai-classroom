<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconChevronRight, IconMessageCircle, IconPencil } from '@tabler/icons-vue'

const FEEDBACK_FORM_URL =
  'https://docs.qq.com/form/page/DTHBuakhMQktId1Zv?layoutKey=formmix&templateId=wr44u6anof8m3k1tmw4bnfb3uw&create_type=2&no_promotion=1&is_blank_or_template=template'
import MoocHeader from './MoocHeader.vue'
import MoocFooter from './MoocFooter.vue'
import ArticleGrid from './ArticleGrid.vue'
import CategoryIcon from './CategoryIcon.vue'
import { useArticles } from '../composables/useArticles'
import type { Article } from '../composables/useArticles'

const FEATURED_COUNT = 8

const { categories, recent, random } = useArticles()
const featuredArticles = ref<Article[]>(recent(FEATURED_COUNT))

onMounted(() => {
  featuredArticles.value = random(FEATURED_COUNT)
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

    <section class="section section-community">
      <div class="section-inner fade-in">
        <div class="community-banner">
          <div class="community-banner-glow" aria-hidden="true" />
          <div class="community-copy">
            <p class="community-eyebrow">一起共建</p>
            <h2>分享经验，让课堂更贴近你的需求</h2>
            <p>
              无论是想投稿一篇实践复盘、反馈某篇文章的质量，还是告诉我们还缺哪类主题——都欢迎通过问卷与我们交流，你的声音会直接参与内容规划。
            </p>
          </div>
          <div class="community-actions">
            <a
              :href="FEEDBACK_FORM_URL"
              class="community-card community-card-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="community-card-icon" aria-hidden="true">
                <IconMessageCircle :size="24" :stroke="1.75" />
              </span>
              <span class="community-card-body">
                <strong>意见反馈</strong>
                <span>填写问卷，向我们提供宝贵意见</span>
              </span>
              <IconChevronRight class="community-card-arrow" :size="20" :stroke="1.75" aria-hidden="true" />
            </a>
            <a href="/guide/contributing" class="community-card">
              <span class="community-card-icon" aria-hidden="true">
                <IconPencil :size="24" :stroke="1.75" />
              </span>
              <span class="community-card-body">
                <strong>参与投稿</strong>
                <span>查看投稿规范，分享你的 AI 协同实践经验</span>
              </span>
              <IconChevronRight class="community-card-arrow" :size="20" :stroke="1.75" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <MoocFooter />
  </div>
</template>
