<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()

interface SearchSection { id: string, title: string, titles?: string[], content?: string, level?: number }

const q = ref('')
const selected = ref(0)
const sections = ref<SearchSection[]>([])
const loaded = ref(false)
const inputEl = ref<HTMLInputElement>()

onMounted(async () => {
  inputEl.value?.focus()
  if (!loaded.value) {
    sections.value = (await queryCollectionSearchSections('docs')) as unknown as SearchSection[]
    loaded.value = true
  }
})

const hits = computed(() => {
  const needle = q.value.trim().toLowerCase()
  if (!needle) return sections.value.slice(0, 12)
  return sections.value
    .filter(s => s.title?.toLowerCase().includes(needle) || s.content?.toLowerCase().includes(needle))
    .slice(0, 20)
})
watch(hits, () => { selected.value = 0 })

const hitUrl = (s: SearchSection) => docsIdToUrl(s.id)

function go(s: SearchSection) {
  emit('close')
  navigateTo(hitUrl(s))
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { selected.value = Math.min(selected.value + 1, hits.value.length - 1); e.preventDefault() }
  else if (e.key === 'ArrowUp') { selected.value = Math.max(selected.value - 1, 0); e.preventDefault() }
  else if (e.key === 'Enter' && hits.value[selected.value]) go(hits.value[selected.value]!)
  else if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="docs-search-overlay" @click.self="emit('close')">
      <div class="docs-search-box" role="dialog" aria-label="Search documentation">
        <input
          ref="inputEl" v-model="q" class="docs-search-input" type="search"
          placeholder="Search documentation…" @keydown="onKey"
        >
        <div class="docs-search-results">
          <p v-if="!loaded" class="docs-search-empty">Loading index…</p>
          <p v-else-if="!hits.length" class="docs-search-empty">No results for “{{ q }}”.</p>
          <a
            v-for="(s, i) in hits" :key="s.id"
            :href="hitUrl(s)"
            class="docs-search-hit"
            :class="{ selected: i === selected }"
            @click.prevent="go(s)" @mouseenter="selected = i"
          >
            <span v-if="s.titles?.length" class="docs-search-hit-crumb">{{ s.titles.join(' › ') }}</span>
            <span class="docs-search-hit-title">{{ s.title }}</span>
            <span v-if="s.content" class="docs-search-hit-text">{{ s.content }}</span>
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
