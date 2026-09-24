export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Learn Fell',
      short_name: 'Learn Fell',
      lang: 'fr',
      display: 'standalone',
      start_url: '/',
    },
    workbox: {
      navigateFallback: '/',
    },
    devOptions: {
      enabled: false,
    },
  },
})
