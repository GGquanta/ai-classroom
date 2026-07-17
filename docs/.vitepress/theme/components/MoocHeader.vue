<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vitepress'
import { IconSearch, IconMenu2, IconX } from '@tabler/icons-vue'
import MoocSearch from './MoocSearch.vue'
import { useFavorites } from '../composables/useFavorites'

const route = useRoute()
const menuOpen = ref(false)
const searchRef = ref<InstanceType<typeof MoocSearch> | null>(null)
const { count } = useFavorites()

const navItems = computed(() => {
  const items = [
    { href: '/', label: '首页', match: (path: string) => path === '/' || path === '/index.html' },
    { href: '/explore', label: '探索文章', match: (path: string) => path.startsWith('/explore') },
  ]

  if (count.value > 0) {
    items.push({
      href: '/favorites',
      label: '我的收藏',
      match: (path: string) => path.startsWith('/favorites'),
    })
  }

  items.push({
    href: '/guide/contributing',
    label: '投稿说明',
    match: (path: string) => path.startsWith('/guide'),
  })

  return items
})

function isActive(match: (path: string) => boolean) {
  return match(route.path)
}

function openSearch() {
  searchRef.value?.open()
  menuOpen.value = false
}

function closeMenu() {
  menuOpen.value = false
}

const isMac = computed(() => {
  if (typeof navigator === 'undefined') return true
  return /Mac|iPhone|iPad/.test(navigator.platform)
})
</script>

<template>
  <header class="mooc-header">
    <div class="header-inner">
      <a href="/" class="brand" @click="closeMenu">
        <img src="/logo.png" alt="" class="brand-icon" />
        <span class="brand-text">国光量子 · AI 课堂</span>
      </a>

      <nav class="header-nav" aria-label="主导航">
        <a
          v-for="item in navItems"
          :key="item.href"
          :href="item.href"
          class="nav-link"
          :class="{ active: isActive(item.match) }"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="header-actions">
        <button type="button" class="search-btn" aria-label="搜索" @click="openSearch">
          <IconSearch :size="18" :stroke="1.75" aria-hidden="true" />
          <span class="search-label">搜索</span>
          <kbd class="search-kbd">{{ isMac ? '⌘' : 'Ctrl' }} K</kbd>
        </button>

        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="menuOpen = !menuOpen"
        >
          <IconMenu2 v-if="!menuOpen" :size="22" :stroke="1.75" aria-hidden="true" />
          <IconX v-else :size="22" :stroke="1.75" aria-hidden="true" />
        </button>
      </div>
    </div>

    <nav v-if="menuOpen" class="mobile-nav" aria-label="移动端导航">
      <a
        v-for="item in navItems"
        :key="item.href"
        :href="item.href"
        class="mobile-nav-link"
        :class="{ active: isActive(item.match) }"
        @click="closeMenu"
      >
        {{ item.label }}
      </a>
      <button type="button" class="mobile-nav-link mobile-search" @click="openSearch">
        搜索内容
      </button>
    </nav>
  </header>

  <MoocSearch ref="searchRef" />
</template>
