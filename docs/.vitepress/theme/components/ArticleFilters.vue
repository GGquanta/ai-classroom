<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '../composables/useArticles'
import { normalizeColor } from '../composables/useArticles'

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
  <div class="filters filters-compact">
    <div class="filters-main">
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
          :style="
            category === cat.id
              ? { backgroundColor: normalizeColor(cat.color ?? '#0b5cab'), borderColor: normalizeColor(cat.color ?? '#0b5cab') }
              : {}
          "
          @click="category = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="filters-side">
        <select id="author-filter" v-model="author" class="filter-select" aria-label="按作者筛选">
          <option value="all">全部作者</option>
          <option v-for="name in authors" :key="name" :value="name">{{ name }}</option>
        </select>

        <select id="sort-filter" v-model="sort" class="filter-select" aria-label="按时间排序">
          <option value="newest">最新发布</option>
          <option value="oldest">最早发布</option>
        </select>
      </div>
    </div>
  </div>
</template>
