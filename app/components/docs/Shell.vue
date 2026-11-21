<script setup lang="ts">
import type { DocsNavGroup } from '~/composables/useDocs'

interface TocLink { id: string, text: string, depth?: number, children?: TocLink[] }

defineProps<{
  groups: DocsNavGroup[]
  currentUrl: string
  toc?: TocLink[]
}>()

const searchOpen = ref(false)
const navOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { navOpen.value = false })

const onGlobalKey = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { searchOpen.value = true; e.preventDefault() }
}
onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <div class="docs">
    <DocsTopbar @open-search="searchOpen = true" @toggle-nav="navOpen = !navOpen" />
    <DocsSearchModal v-if="searchOpen" @close="searchOpen = false" />
    <div class="docs-layout">
      <DocsSidebar :groups="groups" :current-url="currentUrl" :open="navOpen" @navigate="navOpen = false" />
      <div class="docs-content"><slot /></div>
      <DocsTocRail :toc="toc ?? []" />
    </div>
  </div>
</template>
