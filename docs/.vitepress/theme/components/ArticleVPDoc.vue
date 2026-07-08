<script setup lang="ts">
import { computed } from 'vue'
import { Content, useRoute } from 'vitepress'
import { useData } from 'vitepress/dist/client/theme-default/composables/data'
import { useSidebar } from 'vitepress/dist/client/theme-default/composables/sidebar'
import VPDocAside from 'vitepress/dist/client/theme-default/components/VPDocAside.vue'
import VPDocFooter from 'vitepress/dist/client/theme-default/components/VPDocFooter.vue'

const { theme } = useData()
const route = useRoute()
const { hasSidebar, hasAside } = useSidebar()

const pageName = computed(() =>
  route.path.replace(/[./]+/g, '_').replace(/_html$/, ''),
)
</script>

<template>
  <div
    class="VPDoc"
    :class="{ 'has-sidebar': hasSidebar, 'has-aside': hasAside }"
  >
    <slot name="doc-top" />
    <div class="container">
      <div class="content">
        <div class="content-container">
          <slot name="doc-before" />
          <div v-if="hasAside" class="article-body">
            <main class="main">
              <Content
                class="vp-doc"
                :class="[
                  pageName,
                  theme.externalLinkIcon && 'external-link-icon-enabled',
                ]"
              />
            </main>
            <aside class="article-toc" aria-label="阅读导航">
              <div class="article-toc-sticky">
                <div class="article-toc-scroll">
                  <VPDocAside>
                  <template #aside-top><slot name="aside-top" /></template>
                  <template #aside-bottom><slot name="aside-bottom" /></template>
                  <template #aside-outline-before><slot name="aside-outline-before" /></template>
                  <template #aside-outline-after><slot name="aside-outline-after" /></template>
                  <template #aside-ads-before><slot name="aside-ads-before" /></template>
                  <template #aside-ads-after><slot name="aside-ads-after" /></template>
                </VPDocAside>
                </div>
              </div>
            </aside>
          </div>
          <main v-else class="main">
            <Content
              class="vp-doc"
              :class="[
                pageName,
                theme.externalLinkIcon && 'external-link-icon-enabled',
              ]"
            />
          </main>
          <VPDocFooter>
            <template #doc-footer-before><slot name="doc-footer-before" /></template>
          </VPDocFooter>
          <slot name="doc-after" />
        </div>
      </div>
    </div>
    <slot name="doc-bottom" />
  </div>
</template>
