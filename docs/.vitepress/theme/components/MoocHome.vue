<script setup lang="ts">
import MoocHeader from './MoocHeader.vue'
import ArticleGrid from './ArticleGrid.vue'
import { useArticles } from '../composables/useArticles'

const { articles, categories, recent } = useArticles()
</script>

<template>
  <div class="mooc-page">
    <MoocHeader />

    <section class="hero">
      <div class="hero-inner">
        <p class="hero-eyebrow">团队知识库 · 持续更新</p>
        <h1 class="hero-title">AI 协同办公与开发<br />实战经验课堂</h1>
        <p class="hero-subtitle">
          汇集 AI 工具使用、协同流程、Prompt 模板与项目案例，像在线课程一样系统学习、随时查阅。
        </p>
        <div class="hero-actions">
          <a href="/explore" class="btn btn-primary">浏览全部内容</a>
          <a href="/guide/contributing" class="btn btn-outline">参与投稿</a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <strong>{{ articles.length }}</strong>
            <span>篇文章</span>
          </div>
          <div class="stat">
            <strong>{{ categories.length }}</strong>
            <span>个分类</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-inner">
        <div class="section-head">
          <h2>内容分类</h2>
          <p>按主题维度快速进入感兴趣的方向</p>
        </div>
        <div class="category-cards">
          <a
            v-for="cat in categories"
            :key="cat.id"
            :href="`/explore?category=${cat.id}`"
            class="category-card"
            :style="{ '--cat-color': cat.color ?? '#0b5cab' }"
          >
            <span class="category-icon">{{ cat.label.charAt(0) }}</span>
            <h3>{{ cat.label }}</h3>
            <p>{{ cat.description }}</p>
            <span class="category-link">进入分类 →</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-head">
          <h2>最新发布</h2>
          <a href="/explore" class="section-more">查看全部 →</a>
        </div>
        <ArticleGrid :articles="recent(6)" empty-text="暂无文章，欢迎投稿" />
      </div>
    </section>

    <footer class="mooc-footer">
      <div class="footer-inner">
        <p>AI 课堂 · 基于 VitePress 构建</p>
        <p>
          <a href="https://ai-classroom.qubitlab.cc">ai-classroom.qubitlab.cc</a>
          ·
          <a href="https://github.com/GGquanta/ai-classroom">GitHub</a>
        </p>
      </div>
    </footer>
  </div>
</template>
