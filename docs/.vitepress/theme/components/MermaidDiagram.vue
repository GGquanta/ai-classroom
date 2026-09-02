<script setup lang="ts">
import { computed } from 'vue'
import { renderSiteMermaid } from '../../mermaid/render.mjs'

const props = defineProps<{
  code: string
}>()

const result = computed(() => renderSiteMermaid(props.code))
</script>

<template>
  <div
    class="mermaid-diagram"
    :class="{ 'mermaid-diagram--error': result.error }"
    data-renderer="beautiful-mermaid"
  >
    <template v-if="result.error">
      <p class="mermaid-diagram__error">{{ result.error }}</p>
      <pre class="mermaid-diagram__fallback"><code>{{ code.trim() }}</code></pre>
    </template>
    <div v-else v-html="result.svg" />
  </div>
</template>
