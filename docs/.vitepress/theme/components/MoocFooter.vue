<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mooc-footer">
    <div class="footer-grid">
      <div class="footer-col">
        <p class="footer-brand">国光量子 · AI 课堂</p>
        <p class="footer-desc">团队 AI 协同办公与开发经验知识库，像在线课程一样系统学习。</p>
      </div>
      <div class="footer-col">
        <p class="footer-label">站点</p>
        <nav class="footer-links">
          <a href="/">首页</a>
          <a href="/explore">探索文章</a>
          <a href="/guide/contributing">投稿说明</a>
          <a href="/about">关于本页面</a>
        </nav>
      </div>
      <div class="footer-col">
        <p class="footer-label">链接</p>
        <nav class="footer-links">
          <a href="https://ai-classroom.qubitlab.cc" target="_blank" rel="noopener">ai-classroom.qubitlab.cc</a>
          <a href="https://github.com/GGquanta/ai-classroom" target="_blank" rel="noopener">GitHub</a>
        </nav>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-copyright">© {{ year }} 国光量子 · AI 课堂 · MIT License</p>
      <p class="footer-credits">
        <span>设计与开发</span>
        <span class="footer-credits-dot" aria-hidden="true">·</span>
        <span class="footer-credits-team">
          <img
            src="/ai-research-logo.png"
            alt=""
            width="20"
            height="20"
            class="footer-credits-logo"
          />
          <span>AI研究小组</span>
        </span>
      </p>
    </div>
  </footer>
</template>
