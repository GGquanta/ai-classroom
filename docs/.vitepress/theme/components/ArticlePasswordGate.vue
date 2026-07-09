<script setup lang="ts">
import { ref } from 'vue'
import { IconLock } from '@tabler/icons-vue'
import { useArticleAccess } from '../composables/useArticleAccess'

const emit = defineEmits<{
  unlocked: []
}>()

const { verifyAndUnlock } = useArticleAccess()

const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  if (submitting.value) return
  error.value = ''

  const value = password.value.trim()
  if (!value) {
    error.value = '请输入访问密码'
    return
  }

  submitting.value = true
  try {
    const ok = await verifyAndUnlock(value)
    if (ok) {
      emit('unlocked')
    } else {
      error.value = '密码不正确，请重试'
      password.value = ''
    }
  } catch {
    error.value = '验证失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="article-password-gate" aria-labelledby="article-password-title">
    <div class="article-password-card">
      <div class="article-password-icon" aria-hidden="true">
        <IconLock :size="28" :stroke="1.75" />
      </div>
      <h2 id="article-password-title" class="article-password-title">本文受密码保护</h2>
      <p class="article-password-lead">请输入访问密码以阅读全文。</p>

      <form class="article-password-form" @submit.prevent="submit">
        <label class="sr-only" for="article-access-password">访问密码</label>
        <input
          id="article-access-password"
          v-model="password"
          type="password"
          class="article-password-input"
          placeholder="访问密码"
          autocomplete="current-password"
          :disabled="submitting"
        />
        <button type="submit" class="btn btn-primary article-password-submit" :disabled="submitting">
          {{ submitting ? '验证中…' : '确认' }}
        </button>
      </form>

      <p v-if="error" class="article-password-error" role="alert">{{ error }}</p>

      <p class="article-password-hint">
        如需访问密码，请向网站管理员申请。详见
        <a href="/guide/contributing">投稿指南</a>
        中的联系方式。
      </p>
    </div>
  </section>
</template>
