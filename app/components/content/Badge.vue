<script setup lang="ts">
// MDC :badge[text]{color="success"} — renders the status pills used throughout the guide.
defineProps<{ color?: string }>()
</script>

<template>
  <span
    class="docs-badge"
    :class="{ warn: color === 'warning' || color === 'warn', neutral: color === 'neutral' || color === 'secondary' }"
  ><slot /></span>
</template>
