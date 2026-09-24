import { defineOSDDNuxtConfig } from 'nuxt-osdd'

export default defineOSDDNuxtConfig({
  osdd: {
    technical: ['Vuetify', 'Theme', 'Internationalization', 'Pwa', 'State', 'ApiClient'],
    functional: ['Home'],
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils/module'],
})
