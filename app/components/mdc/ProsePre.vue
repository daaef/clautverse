<script setup lang="ts">
// Prose <pre> override: Protocol-style always-dark code card with a copy button.
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  meta?: string
  class?: string
}>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code ?? '')
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 1500)
  }
  catch { /* clipboard unavailable (non-secure context) — leave the button inert */ }
}
onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="docs-pre">
    <div class="docs-pre-head">
      <span class="docs-pre-label">
        <span v-if="language" class="docs-pre-lang">{{ language }}</span>
        <span v-if="filename">{{ filename }}</span>
      </span>
      <button type="button" class="docs-pre-copy" @click="copy">{{ copied ? 'Copied!' : 'Copy' }}</button>
    </div>
    <pre :class="$props.class"><slot /></pre>
  </div>
</template>
