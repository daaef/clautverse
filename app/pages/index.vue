<script setup lang="ts">
useHead({ title: 'Clautverse' })
</script>

<template>
  <div class="docs">
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh">
      <div style="text-align: center; max-width: 34rem; padding: 2rem">
        <img src="/clautverse-ghost.png" alt="Clautverse" style="width: 4rem; height: 4rem; border-radius: 1rem; margin: 0 auto 1.5rem">
        <h1 style="color: var(--d-text-strong); font-size: 1.875rem; font-weight: 700; margin: 0 0 0.75rem">Clautverse</h1>
        <p style="color: var(--d-text); margin: 0 0 2rem">Fan ecosystem platform — Nuxt full-stack app with the Nitro API under <code>/api</code>.</p>
        <div style="display: flex; gap: 0.75rem; justify-content: center">
          <NuxtLink to="/docs" class="docs-badge" style="font-size: 0.875rem; padding: 0.5rem 1rem; text-decoration: none">Documentation</NuxtLink>
          <NuxtLink to="/docs/api" class="docs-badge neutral" style="font-size: 0.875rem; padding: 0.5rem 1rem; text-decoration: none">API Explorer</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
