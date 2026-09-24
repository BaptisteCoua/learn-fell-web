export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    locales: [{ code: 'fr', language: 'fr-FR', file: 'fr.json' }],
  },
})
