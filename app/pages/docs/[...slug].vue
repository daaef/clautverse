<script setup lang="ts">
const route = useRoute()
const { data: pages } = await useDocsPages()

const url = computed(() => docsRouteUrl(route.params.slug as string[] | undefined))
const nav = computed(() => (pages.value ? buildDocsNav(pages.value) : { nav: [], flat: [] }))
const page = computed(() => pages.value?.find(p => docUrl(p.stem) === url.value) ?? null)
const toc = computed(() => (page.value?.body?.toc?.links ?? []) as { id: string, text: string, depth?: number, children?: { id: string, text: string, depth?: number }[] }[])
const flatIndex = computed(() => nav.value.flat.findIndex(i => i.url === url.value))
const prev = computed(() => flatIndex.value > 0 ? nav.value.flat[flatIndex.value - 1] : null)
const next = computed(() => flatIndex.value >= 0 ? (nav.value.flat[flatIndex.value + 1] ?? null) : null)

useHead(() => ({
  title: page.value?.title ? `${page.value.title} · Clautverse Docs` : 'Clautverse Docs',
  meta: page.value?.description ? [{ name: 'description', content: page.value.description }] : [],
}))
</script>

<template>
  <DocsShell :groups="nav.nav" :current-url="url" :toc="toc">
    <article v-if="page" class="docs-article docs-prose">
      <p v-if="flatIndex >= 0" class="docs-tag">
        {{ nav.nav.find(g => g.items.some(i => i.url === url))?.title ?? 'Guide' }}
      </p>
      <ContentRenderer :value="page" />
      <DocsPrevNext :prev="prev" :next="next" />
    </article>
    <article v-else class="docs-article docs-prose">
      <h1>This page took a wrong turn.</h1>
      <p class="docs-lead">That documentation page doesn't exist or has moved.</p>
      <p><NuxtLink to="/docs">Back to documentation</NuxtLink></p>
    </article>
  </DocsShell>
</template>
