<script setup lang="ts">
interface TocLink { id: string, text: string, depth?: number, children?: TocLink[] }
const props = defineProps<{ toc: TocLink[] }>()

const links = computed(() => (props.toc ?? []).filter(l => (l.depth ?? 2) <= 3))
const active = ref('')

// Scroll-spy: highlight the heading nearest the top of the viewport.
let observer: IntersectionObserver | undefined
onMounted(() => {
  const headings = links.value
    .map(l => document.getElementById(l.id))
    .filter((el): el is HTMLElement => !!el)
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) active.value = e.target.id
  }, { rootMargin: '0px 0px -75% 0px' })
  headings.forEach(h => observer!.observe(h))
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <aside v-if="links.length" class="docs-tocrail" aria-label="On this page">
    <p class="docs-toc-title">On this page</p>
    <a
      v-for="l in links" :key="l.id"
      :href="`#${l.id}`"
      class="docs-toc-link"
      :class="{ active: active === l.id, sub: (l.depth ?? 2) === 3 }"
    >{{ l.text }}</a>
  </aside>
</template>
