<script setup lang="ts">
// MDC ::guide-section — static port of guide/app/components/content/GuideSection.vue.
// The interactive Question/Report prompt actions are intentionally not ported (v1: read-only docs).
withDefaults(defineProps<{
  id: string
  title: string
  type?: string
  filePath?: string
  expectedResult?: string
  verification?: string
  references?: string[] | string
  actions?: boolean
}>(), { type: 'explanation' })

const typeLabel = (t: string) => t.replace('-', ' ')
</script>

<template>
  <section :id="id" class="docs-section" :class="{ 'open-decision': type === 'open-decision' }">
    <header class="docs-section-head">
      <h3 class="docs-section-title">{{ title }}</h3>
      <span class="docs-badge" :class="{ warn: type === 'open-decision', neutral: type !== 'open-decision' }">{{ typeLabel(type) }}</span>
      <code v-if="filePath" class="docs-section-file">{{ filePath }}</code>
    </header>
    <p v-if="type === 'open-decision'" class="docs-section-open-note">
      Open decision: anything below is a non-final scaffold, not production behaviour.
    </p>
    <div class="docs-section-body">
      <slot />
    </div>
  </section>
</template>
