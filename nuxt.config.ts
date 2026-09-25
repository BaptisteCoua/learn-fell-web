import { defineOSDDNuxtConfig } from 'nuxt-osdd'

export default defineOSDDNuxtConfig({
  osdd: {
    technical: [
      'Vuetify',
      'Theme',
      'Internationalization',
      'Pwa',
      'State',
      'ApiClient',
      'RichText',
      'Notification',
    ],
    functional: ['Home', 'Account', 'Catalog', 'Authoring', 'Moderation', 'Learning'],
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: { decorators: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils/module'],
})
