<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import {
  IconRobot,
  IconRoute,
  IconMessageChatbot,
  IconBulb,
} from '@tabler/icons-vue'

const props = withDefaults(
  defineProps<{
    categoryId: string
    size?: number
    stroke?: number
  }>(),
  { size: 22, stroke: 1.75 },
)

const iconMap: Record<string, Component> = {
  tools: IconRobot,
  workflows: IconRoute,
  prompts: IconMessageChatbot,
  cases: IconBulb,
}

const icon = computed(() => iconMap[props.categoryId] ?? IconRobot)
</script>

<template>
  <component :is="icon" class="category-icon-svg" :size="size" :stroke="stroke" aria-hidden="true" />
</template>
