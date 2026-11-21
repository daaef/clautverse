<script setup lang="ts">
// Prose link override: the guide's markdown uses root-relative links
// (/getting-started/introduction). Inside the app they must resolve under /docs.
// Links into the live API (/api/...) and external links are left alone.
const props = defineProps<{ href?: string }>()

const rewritten = computed(() => {
  const h = props.href ?? ''
  if (!h.startsWith('/')) return h
  if (h.startsWith('/docs') || h.startsWith('/api/')) return h
  return '/docs' + h
})
const external = computed(() => /^https?:\/\//.test(props.href ?? ''))
</script>

<template>
  <NuxtLink v-if="!external" :to="rewritten"><slot /></NuxtLink>
  <a v-else :href="href" rel="noopener" target="_blank"><slot /></a>
</template>
