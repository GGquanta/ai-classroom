<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '../composables/useArticles'

const props = defineProps<{
  categories: Category[]
  authors: string[]
  modelCategory: string
  modelAuthor: string
  modelSort: 'newest' | 'oldest'
}>()

const emit = defineEmits<{
  'update:modelCategory': [value: string]
  'update:modelAuthor': [value: string]
  'update:modelSort': [value: 'newest' | 'oldest']
}>()

const category = computed({
  get: () => props.modelCategory,
  set: (v) => emit('update:modelCategory', v),
})

const author = computed({
  get: () => props.modelAuthor,
  set: (v) => emit('update:modelAuthor', v),
})

const sort = computed({
  get: () => props.modelSort,
  set: (v) => emit('update:modelSort', v),
})
</script>

<template>
  <div class="filters">
    <div class="filter-group">
      <span class="filter-label">分类</span>
      <div class="filter-pills">
        <button
          type="button"
          class="pill"
          :class="{ active: category === 'all' }"
          @click="category = 'all'"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          class="pill"
          :class="{ active: category === cat.id }"
          :style="category === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}"
          @click="category = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <div class="filter-row">
      <div class="filter-group inline">
        <label class="filter-label" for="author-filter">作者</label>
        <select id="author-filter" v-model="author" class="filter-select">
          <option value="all">全部作者</option>
          <option v-for="name in authors" :key="name" :value="name">{{ name }}</option>
        </select>
      </div>

      <div class="filter-group inline">
        <label class="filter-label" for="sort-filter">时间</label>
        <select id="sort-filter" v-model="sort" class="filter-select">
          <option value="newest">最新发布</option>
          <option value="oldest">最早发布</option>
        </select>
      </div>
    </div>
  </div>
</template>
