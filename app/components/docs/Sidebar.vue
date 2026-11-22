<script setup lang="ts">
// Left rail: one link per API tag, jumping to that group on the page.
defineProps<{ groups: { tag: string, items: unknown[] }[], open?: boolean }>()
const emit = defineEmits<{ navigate: [] }>()
</script>

<template>
  <aside class="docs-side" :class="{ open }">
    <nav class="docs-nav" aria-label="API groups">
      <h2 class="docs-nav-title">API groups</h2>
      <a
        v-for="g in groups" :key="g.tag"
        :href="`#tag-${g.tag}`"
        class="docs-nav-link"
        @click="emit('navigate')"
      >{{ g.tag }} <span class="docs-api-count">{{ g.items.length }}</span></a>
    </nav>
  </aside>
</template>
