export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'CINQ',
      short_name: 'CINQ',
      description: 'Apprenez tout, retenez tout, avec la méthode Leitner.',
      theme_color: '#FACC15',
      background_color: '#FFFBEB',
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
