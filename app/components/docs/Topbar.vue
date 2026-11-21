<script setup lang="ts">
const emit = defineEmits<{ 'open-search': [], 'toggle-nav': [] }>()

const light = ref(false)
onMounted(() => { light.value = document.documentElement.classList.contains('docs-light') })
function toggle() {
  light.value = !light.value
  document.documentElement.classList.toggle('docs-light', light.value)
  try { localStorage.setItem('clautverse-docs-theme', light.value ? 'light' : 'dark') } catch {}
}
</script>

<template>
  <header class="docs-top">
    <div class="docs-top-left">
      <button type="button" class="docs-icon-btn docs-burger" aria-label="Toggle navigation" @click="emit('toggle-nav')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>
      <NuxtLink to="/docs" class="docs-logo" aria-label="Clautverse docs home">
        <img src="/clautverse-ghost.png" alt="" class="docs-logo-img">
        <span class="docs-logo-text">Clautverse <span class="docs-logo-sub">Docs</span></span>
      </NuxtLink>
    </div>
    <button type="button" class="docs-search-btn" @click="emit('open-search')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
      Search documentation
      <span class="docs-search-kbd">⌘K</span>
    </button>
    <div class="docs-top-right">
      <button type="button" class="docs-icon-btn" :aria-label="light ? 'Switch to dark theme' : 'Switch to light theme'" @click="toggle">
        <svg v-if="light" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      </button>
    </div>
  </header>
</template>
