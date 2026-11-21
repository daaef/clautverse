<script setup lang="ts">
import type { DocsNavGroup } from '~/composables/useDocs'

const props = defineProps<{
  groups: DocsNavGroup[]
  currentUrl: string
  open?: boolean
}>()
const emit = defineEmits<{ navigate: [] }>()
const isActive = (url: string) => url === props.currentUrl
</script>

<template>
  <aside class="docs-side" :class="{ open }">
    <nav class="docs-nav" aria-label="Documentation">
      <NuxtLink
        to="/docs/api"
        class="docs-nav-explorer"
        :class="{ active: isActive('/docs/api') }"
        @click="emit('navigate')"
      >
        <span>API Explorer</span>
        <span class="docs-badge">live</span>
      </NuxtLink>
      <div v-for="g in groups" :key="g.title" class="docs-nav-group">
        <h2 class="docs-nav-title">{{ g.title }}</h2>
        <NuxtLink
          v-for="item in g.items" :key="item.url"
          :to="item.url"
          class="docs-nav-link"
          :class="{ active: isActive(item.url) }"
          :aria-current="isActive(item.url) ? 'page' : undefined"
          @click="emit('navigate')"
        >{{ item.title }}</NuxtLink>
      </div>
    </nav>
  </aside>
</template>
