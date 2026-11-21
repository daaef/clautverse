<script setup lang="ts">
const route = useRoute()
const url = computed(() => route.path.replace(/\/$/, '') || '/docs/api')
const { data: pages } = await useDocsPages()
const groups = computed(() => (pages.value ? buildDocsNav(pages.value).nav : []))

const { data: spec } = useOpenApi()
const tagGroups = computed(() => groupByTag(specOperations(spec.value)))
const toc = computed(() => tagGroups.value.map(g => ({ id: `tag-${g.tag}`, text: g.tag, depth: 2 })))
const filter = ref('')
const visible = computed(() => {
  const f = filter.value.trim().toLowerCase()
  if (!f) return tagGroups.value
  return tagGroups.value
    .map(g => ({ tag: g.tag, items: g.items.filter(o => `${o.method} ${o.path} ${o.summary ?? ''}`.toLowerCase().includes(f)) }))
    .filter(g => g.items.length)
})

useHead({ title: 'API Explorer · Clautverse Docs' })
</script>

<template>
  <DocsShell :groups="groups" :current-url="url" :toc="toc">
    <article class="docs-article docs-prose">
      <p class="docs-tag">Live contract</p>
      <h1>API Explorer</h1>
      <p class="docs-lead">
        Every operation in <code>openapi/clautverse.yaml</code>, with a live request panel.
        Sign in below — requests run as your session against the same Nitro API this app serves.
      </p>
      <DocsAuthPanel />
      <input v-model="filter" class="docs-api-filter" type="search" placeholder="Filter operations… e.g. communities, missions, XP">
      <template v-if="spec">
        <section v-for="g in visible" :key="g.tag" :id="`tag-${g.tag}`" class="docs-api-group">
          <h2 class="docs-api-tag-title"><code>{{ g.tag }}</code> <span class="docs-api-count">{{ g.items.length }}</span></h2>
          <ApiEndpoint v-for="op in g.items" :key="`${op.method}-${op.path}`" :method="op.method" :path="op.path" />
        </section>
        <p v-if="!visible.length" class="docs-search-empty">No operations match “{{ filter }}”.</p>
      </template>
      <p v-else class="docs-search-empty">Loading specification…</p>
    </article>
  </DocsShell>
</template>
