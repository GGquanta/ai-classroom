<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'

const VPLocalSearchBox = defineAsyncComponent(
  () => import('vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue'),
)

const showSearch = ref(false)

function isEditingContent(event: KeyboardEvent): boolean {
  const el = event.target as HTMLElement
  return (
    el.isContentEditable ||
    el.tagName === 'INPUT' ||
    el.tagName === 'SELECT' ||
    el.tagName === 'TEXTAREA'
  )
}

function handleKeydown(event: KeyboardEvent) {
  if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    showSearch.value = true
    return
  }
  if (event.key === '/' && !isEditingContent(event)) {
    event.preventDefault()
    showSearch.value = true
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

function open() {
  showSearch.value = true
}

defineExpose({ open })
</script>

<template>
  <VPLocalSearchBox v-if="showSearch" @close="showSearch = false" />
</template>
