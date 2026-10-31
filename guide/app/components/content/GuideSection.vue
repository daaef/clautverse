<script setup lang="ts">
import type { SectionType } from '~/composables/usePromptBuilder'

const props = withDefaults(defineProps<{
  id: string
  title: string
  type?: SectionType
  filePath?: string
  expectedResult?: string
  verification?: string
  /** Documentation references; an array, or one string separated by "|". */
  references?: string[] | string
  /** Force actions on/off. Defaults to on for code, explanation, expected-result and verification. */
  actions?: boolean
}>(), { type: 'explanation', filePath: undefined, expectedResult: undefined, verification: undefined, references: undefined, actions: undefined })

const DEFAULT_ACTION_TYPES: SectionType[] = ['code', 'explanation', 'expected-result', 'verification']
const showActions = computed(() => props.actions ?? DEFAULT_ACTION_TYPES.includes(props.type))
const extras = computed(() => ({
  expectedResult: props.expectedResult,
  verification: props.verification,
  references: Array.isArray(props.references) ? props.references : props.references?.split('|').map(s => s.trim()).filter(Boolean),
}))
const typeLabel = computed(() => props.type.replace('-', ' '))
</script>

<template>
  <section
    :id="id"
    class="my-6 rounded-lg border border-default p-4"
    :class="type === 'open-decision' ? 'border-warning' : ''"
    :data-guide-section-id="id"
    :data-guide-section-type="type"
    :data-guide-section-title="title"
    :data-file-path="filePath || undefined"
  >
    <header class="mb-2 flex flex-wrap items-center gap-2">
      <h3 class="m-0 text-lg font-semibold">{{ title }}</h3>
      <UBadge :color="type === 'open-decision' ? 'warning' : 'neutral'" variant="subtle" size="sm">{{ typeLabel }}</UBadge>
      <code v-if="filePath" class="text-xs text-muted">{{ filePath }}</code>
    </header>
    <p v-if="type === 'open-decision'" class="text-sm text-warning">
      Open decision: anything below is a non-final scaffold, not production behaviour.
    </p>
    <div data-guide-section-body>
      <slot />
    </div>
    <footer v-if="showActions" class="mt-3 flex gap-2 border-t border-default pt-3" data-guide-ignore>
      <GuideQuestionAction :section-title="title" :extras="extras" />
      <GuideReportAction :section-title="title" :extras="extras" />
    </footer>
  </section>
</template>
