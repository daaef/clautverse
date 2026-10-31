<script setup lang="ts">
const props = defineProps<{ prompt: string, copyLabel: string }>()
defineEmits<{ back: [] }>()
const status = ref<'idle' | 'copied' | 'failed'>('idle')
const fallback = ref<HTMLTextAreaElement | null>(null)

async function copy() {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
    await navigator.clipboard.writeText(props.prompt)
    status.value = 'copied'
  }
  catch {
    status.value = 'failed'
    await nextTick()
    fallback.value?.focus()
    fallback.value?.select()
  }
}
</script>

<template>
  <div class="space-y-3">
    <p class="rounded-md bg-elevated p-2 text-sm" data-testid="privacy-notice">
      This prompt includes the selected guide section's text and code plus what you type. Review it before copying. The guide does not send, save, or share anything.
    </p>
    <pre class="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-default p-3 text-xs select-text" tabindex="0" aria-label="Prompt preview" data-testid="prompt-preview">{{ prompt }}</pre>
    <div class="flex flex-wrap items-center gap-2">
      <UButton icon="i-lucide-copy" @click="copy">{{ copyLabel }}</UButton>
      <UButton variant="ghost" color="neutral" @click="$emit('back')">Edit</UButton>
      <span aria-live="polite" role="status" class="text-sm" :class="status === 'failed' ? 'text-error' : 'text-success'">
        <template v-if="status === 'copied'">Copied</template>
        <template v-else-if="status === 'failed'">Copy failed. Select the text below and copy it manually.</template>
      </span>
    </div>
    <div v-if="status === 'failed'">
      <label for="prompt-fallback" class="text-sm font-medium">Prompt (select all and copy)</label>
      <textarea id="prompt-fallback" ref="fallback" readonly :value="prompt" rows="8" class="mt-1 w-full rounded-md border border-default p-2 font-mono text-xs" />
    </div>
  </div>
</template>
