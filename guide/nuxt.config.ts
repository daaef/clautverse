// The guide is a separate Nuxt app. It never imports Clautverse application code.
export default defineNuxtConfig({
  extends: ['docus'],
  css: ['~/assets/css/a11y.css'],
  site: { name: 'Clautverse Implementation Guide', url: 'http://localhost:3001' },
  // Private for now (decision 9): keep crawlers out until the guide is approved for publishing.
  robots: { disallow: ['/'] },
  llms: { domain: 'http://localhost:3001' },
  content: {
    build: {
      markdown: {
        // High-contrast code colours so code blocks pass WCAG AA.
        highlight: { theme: { default: 'github-light-high-contrast', light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' } },
      },
    },
  },
})
