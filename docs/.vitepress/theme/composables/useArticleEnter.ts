import { ref, watch, nextTick, onMounted, type ComputedRef } from 'vue'
import { useRoute } from 'vitepress'

export function useArticleEnter(isArticlePage: ComputedRef<boolean>) {
  const enterActive = ref(false)
  const route = useRoute()

  async function triggerEnter() {
    enterActive.value = false
    await nextTick()
    if (typeof document !== 'undefined') {
      void document.body.offsetHeight
    }
    enterActive.value = true
  }

  watch(
    () => route.path,
    () => {
      if (isArticlePage.value) triggerEnter()
      else enterActive.value = false
    },
  )

  onMounted(() => {
    if (isArticlePage.value) {
      requestAnimationFrame(() => triggerEnter())
    }
  })

  return { enterActive }
}
