<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress/dist/client/theme-default/composables/data'
import { useEditLink } from 'vitepress/dist/client/theme-default/composables/edit-link'
import { usePrevNext } from 'vitepress/dist/client/theme-default/composables/prev-next'
import VPLink from 'vitepress/dist/client/theme-default/components/VPLink.vue'
import VPDocFooterLastUpdated from 'vitepress/dist/client/theme-default/components/VPDocFooterLastUpdated.vue'
import ArticleShareCard from './ArticleShareCard.vue'
import { useArticles } from '../composables/useArticles'
import { useArticleAccess } from '../composables/useArticleAccess'

const { theme, page, frontmatter } = useData()
const { getByLink } = useArticles()
const { isProtectedArticle, isUnlocked } = useArticleAccess()

const editLink = useEditLink()
const control = usePrevNext()

const article = computed(() => getByLink(page.value.relativePath))
const canShare = computed(
  () => !!article.value && (!isProtectedArticle(article.value) || isUnlocked.value),
)

const hasEditLink = computed(
  () => theme.value.editLink && frontmatter.value.editLink !== false,
)
const feedbackLink = computed(() => theme.value.feedbackLink)
const hasFeedbackLink = computed(() => !!feedbackLink.value?.url)
const hasLastUpdated = computed(() => page.value.lastUpdated)
const showMeta = computed(
  () => hasEditLink.value || hasFeedbackLink.value || hasLastUpdated.value,
)
const showEditInfo = computed(() => showMeta.value || canShare.value)
const showEditLinks = computed(
  () => hasEditLink.value || hasFeedbackLink.value || canShare.value,
)
const showPager = computed(() => control.value.prev?.link || control.value.next?.link)
const showFooter = computed(
  () => showEditInfo.value || showPager.value,
)
</script>

<template>
  <footer v-if="showFooter" class="VPDocFooter">
    <slot name="doc-footer-before" />

    <div v-if="showEditInfo" class="edit-info">
      <div v-if="showEditLinks" class="edit-links">
        <div v-if="hasEditLink" class="edit-link">
          <VPLink class="edit-link-button" :href="editLink.url" :no-icon="true">
            <span class="vpi-square-pen edit-link-icon" />
            {{ editLink.text }}
          </VPLink>
        </div>

        <div v-if="hasFeedbackLink" class="feedback-link">
          <VPLink
            class="edit-link-button"
            :href="feedbackLink!.url"
            :no-icon="true"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="vpi-heart edit-link-icon" />
            {{ feedbackLink!.text }}
          </VPLink>
        </div>

        <ArticleShareCard />
      </div>

      <div v-if="hasLastUpdated" class="last-updated">
        <VPDocFooterLastUpdated />
      </div>
    </div>

    <nav
      v-if="showPager"
      class="prev-next"
      aria-labelledby="doc-footer-aria-label"
    >
      <span class="visually-hidden" id="doc-footer-aria-label">Pager</span>

      <div class="pager">
        <VPLink
          v-if="control.prev?.link"
          class="pager-link prev"
          :href="control.prev.link"
        >
          <span
            class="desc"
            v-html="theme.docFooter?.prev || 'Previous page'"
          ></span>
          <span class="title" v-html="control.prev.text"></span>
        </VPLink>
      </div>
      <div class="pager">
        <VPLink
          v-if="control.next?.link"
          class="pager-link next"
          :href="control.next.link"
        >
          <span
            class="desc"
            v-html="theme.docFooter?.next || 'Next page'"
          ></span>
          <span class="title" v-html="control.next.text"></span>
        </VPLink>
      </div>
    </nav>
  </footer>
</template>

<style scoped>
.VPDocFooter {
  margin-top: 64px;
}

.edit-info {
  padding-bottom: 18px;
}

@media (min-width: 640px) {
  .edit-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 14px;
  }
}

.edit-links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.prev-next {
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 24px;
  display: grid;
  grid-row-gap: 8px;
}

@media (min-width: 640px) {
  .prev-next {
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 16px;
  }
}

.pager-link {
  display: block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 11px 16px 13px;
  width: 100%;
  height: 100%;
  transition: border-color 0.25s;
}

.pager-link:hover {
  border-color: var(--vp-c-brand-1);
}

.pager-link.next {
  margin-left: auto;
  text-align: right;
}

.desc {
  display: block;
  line-height: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.title {
  display: block;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition: color 0.25s;
}
</style>
