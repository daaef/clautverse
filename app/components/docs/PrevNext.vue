<script setup lang="ts">
import type { DocsNavItem } from '~/composables/useDocs'

defineProps<{ prev?: DocsNavItem | null, next?: DocsNavItem | null }>()
</script>

<template>
  <nav v-if="prev || next" class="docs-prevnext" aria-label="Previous and next pages">
    <NuxtLink v-if="prev" :to="prev.url" class="docs-pn">
      <span class="docs-pn-dir">← Previous</span>
      <span class="docs-pn-title">{{ prev.title }}</span>
    </NuxtLink>
    <NuxtLink v-if="next" :to="next.url" class="docs-pn next">
      <span class="docs-pn-dir">Next →</span>
      <span class="docs-pn-title">{{ next.title }}</span>
    </NuxtLink>
  </nav>
</template>
