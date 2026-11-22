<script setup lang="ts">
// Sets the docs theme class before first paint (prevents a light/dark flash).
// Default: dark; user choice persists in localStorage.
useHead({
  link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
  script: [{
    innerHTML: `try{if(localStorage.getItem('clautverse-docs-theme')==='light')document.documentElement.classList.add('docs-light')}catch(e){}`,
  }],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
