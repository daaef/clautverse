<script setup lang="ts">
// API Explorer — the only page in this app. Lists every operation in
// openapi/clautverse.yaml and lets you send real requests as your session.
const { data: spec } = useOpenApi()
const tagGroups = computed(() => groupByTag(specOperations(spec.value)))
const filter = ref('')
const navOpen = ref(false)
const visible = computed(() => {
  const f = filter.value.trim().toLowerCase()
  if (!f) return tagGroups.value
  return tagGroups.value
    .map(g => ({ tag: g.tag, items: g.items.filter(o => `${o.method} ${o.path} ${o.summary ?? ''}`.toLowerCase().includes(f)) }))
    .filter(g => g.items.length)
})

useHead({ title: 'API Explorer · Clautverse' })
</script>

<template>
  <div class="docs">
    <DocsTopbar @toggle-nav="navOpen = !navOpen" />
    <div class="docs-layout">
      <DocsSidebar :groups="visible" :open="navOpen" @navigate="navOpen = false" />
      <div class="docs-content">
        <article class="docs-article docs-prose">
          <p class="docs-tag">Live contract</p>
          <h1>API Explorer</h1>
          <p class="docs-lead">
            Every operation in <code>openapi/clautverse.yaml</code>, with a live request panel.
            Sign in below — requests run as your session against this app's API.
          </p>
          <DocsAuthPanel />
          <input v-model="filter" class="docs-api-filter" type="search" placeholder="Filter operations… e.g. communities, missions, XP">
          <template v-if="spec">
            <section v-for="g in visible" :id="`tag-${g.tag}`" :key="g.tag" class="docs-api-group">
              <h2 class="docs-api-tag-title"><code>{{ g.tag }}</code> <span class="docs-api-count">{{ g.items.length }}</span></h2>
              <ApiEndpoint v-for="op in g.items" :key="`${op.method}-${op.path}`" :method="op.method" :path="op.path" />
            </section>
            <p v-if="!visible.length" class="docs-search-empty">No operations match “{{ filter }}”.</p>
          </template>
          <p v-else class="docs-search-empty">Loading specification…</p>
        </article>
      </div>
    </div>
  </div>
</template>
