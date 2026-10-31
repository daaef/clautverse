<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { buildReportPrompt, type ReportInput } from '~/composables/usePromptBuilder'
import { readSectionContext, type SectionExtras } from '~/composables/useSectionContext'
import { loadPageMeta } from './usePageMeta'

const props = defineProps<{ sectionTitle: string, extras: SectionExtras }>()
const route = useRoute()
const open = ref(false)
const form = reactive<Required<ReportInput>>({ whatHappened: '', actualResult: '', errorText: '', stepsTaken: '', environment: '' })
const prompt = ref('')
const error = ref('')
const trigger = ref<ComponentPublicInstance | null>(null)

watch(open, (v) => { if (!v) { prompt.value = ''; error.value = '' } })

async function build() {
  if (!form.whatHappened.trim()) { error.value = 'Describe what happened first.'; return }
  error.value = ''
  const ctx = readSectionContext(trigger.value!.$el as Element, await loadPageMeta(route.path), props.extras)
  prompt.value = buildReportPrompt(ctx, { ...form })
}
</script>

<template>
  <UModal v-model:open="open" :title="`Report a problem: ${sectionTitle}`" description="Describe what you saw, then copy a troubleshooting prompt into any AI tool.">
    <UButton ref="trigger" icon="i-lucide-bug" variant="soft" color="neutral" size="sm" :aria-label="`Report a problem with ${sectionTitle}`">
      Report
    </UButton>
    <template #body>
      <form v-if="!prompt" class="space-y-3" @submit.prevent="build">
        <UFormField label="What happened?" name="whatHappened" required :error="error || undefined">
          <UTextarea v-model="form.whatHappened" :maxlength="4000" :rows="3" autoresize aria-required="true" class="w-full" />
        </UFormField>
        <UFormField label="Actual result (optional)" name="actualResult">
          <UTextarea v-model="form.actualResult" :maxlength="4000" :rows="2" autoresize class="w-full" />
        </UFormField>
        <UFormField label="Error text (optional)" name="errorText">
          <UTextarea v-model="form.errorText" :maxlength="8000" :rows="2" autoresize class="w-full font-mono" />
        </UFormField>
        <UFormField label="Steps taken (optional)" name="stepsTaken">
          <UTextarea v-model="form.stepsTaken" :maxlength="4000" :rows="2" autoresize class="w-full" />
        </UFormField>
        <UFormField label="Environment / versions (optional)" name="environment">
          <UInput v-model="form.environment" :maxlength="500" class="w-full" />
        </UFormField>
        <div class="flex justify-end">
          <UButton type="submit">Build report</UButton>
        </div>
      </form>
      <GuidePromptPreview v-else :prompt="prompt" copy-label="Copy report" @back="prompt = ''" />
    </template>
  </UModal>
</template>
