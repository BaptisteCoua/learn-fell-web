export default defineNuxtConfig({
  modules: ['laravel-raom-nuxt'],
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8090/api',
    },
  },
  i18n: {
    locales: [{ code: 'fr', file: 'fr.json' }],
  },
})
