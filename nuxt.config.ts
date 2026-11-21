// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  css: ['~/assets/css/docs.css'],
  runtimeConfig: {
    databaseUrl: '',
    betterAuthSecret: '',
    betterAuthUrl: 'http://localhost:3000',
    mailtrapApiToken: '',
    mailtrapInboxId: '',
    emailFrom: 'Clautverse <no-reply@clautverse.local>',
    cursorSecret: '',
    appVersion: 'dev',
    authRateLimitEnabled: true,
    cronSecret: '',
  },
  nitro: {
    errorHandler: '~~/server/error-handler.ts',
  },
})
