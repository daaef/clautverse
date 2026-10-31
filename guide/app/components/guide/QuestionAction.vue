<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { buildQuestionPrompt } from '~/composables/usePromptBuilder'
import { readSectionContext, type SectionExtras } from '~/composables/useSectionContext'
import { loadPageMeta } from './usePageMeta'

const props = defineProps<{ sectionTitle: string, extras: SectionExtras }>()
const route = useRoute()
const open = ref(false)
const question = ref('')
const prompt = ref('')
const error = ref('')
const trigger = ref<ComponentPublicInstance | null>(null)

watch(open, (v) => { if (!v) { prompt.value = ''; error.value = '' } })

async function build() {
  if (!question.value.trim()) { error.value = 'Type a question first.'; return }
  error.value = ''
  const ctx = readSectionContext(trigger.value!.$el as Element, await loadPageMeta(route.path), props.extras)
  prompt.value = buildQuestionPrompt(ctx, question.value)
}
</script>

<template>
  <UModal v-model:open="open" :title="`Ask about: ${sectionTitle}`" description="Write your question, then copy a ready-made prompt into any AI tool.">
    <UButton ref="trigger" icon="i-lucide-message-circle-question" variant="soft" size="sm" :aria-label="`Question about ${sectionTitle}`">
      Question
    </UButton>
    <template #body>
      <form v-if="!prompt" class="space-y-3" @submit.prevent="build">
        <UFormField label="Your question" name="question" required :error="error || undefined" :hint="`${question.length}/4000`">
          <UTextarea v-model="question" :maxlength="4000" :rows="5" autoresize aria-required="true" class="w-full" />
        </UFormField>
        <div class="flex justify-end">
          <UButton type="submit">Build prompt</UButton>
        </div>
      </form>
      <GuidePromptPreview v-else :prompt="prompt" copy-label="Copy prompt" @back="prompt = ''" />
    </template>
  </UModal>
</template>
