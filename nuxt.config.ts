// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    databaseUrl: '',
    betterAuthSecret: '',
    betterAuthUrl: 'http://localhost:3000',
    resendApiKey: '',
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
