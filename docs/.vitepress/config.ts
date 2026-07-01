import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AI 课堂',
  description: '团队 AI 协同办公、开发与工具使用经验知识库',
  lang: 'zh-CN',
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  hostname: 'https://ai-classroom.qubitlab.cc',

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  ],

  themeConfig: {
    logo: '/favicon.svg',
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [{ text: '如何投稿', link: '/guide/contributing' }],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/GGquanta/ai-classroom' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/GGquanta/ai-classroom/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: 'AI 课堂 · MIT License',
      copyright: 'Copyright © AI 课堂贡献者',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    outline: {
      label: '本页目录',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },
})
