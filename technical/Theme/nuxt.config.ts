import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  css: [fileURLToPath(new URL('./app/assets/styles/cinq.scss', import.meta.url))],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap',
        },
      ],
    },
  },
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'cinq',
        themes: {
          cinq: {
            dark: false,
            colors: {
              background: '#FFFBEB',
              surface: '#FFFFFF',
              primary: '#0A0A0A',
              'on-primary': '#FFFBEB',
              secondary: '#FACC15',
              'on-secondary': '#0A0A0A',
              info: '#3B82F6',
              'on-info': '#0A0A0A',
              error: '#B91C1C',
              'on-error': '#FFFFFF',
              success: '#FACC15',
              'on-success': '#0A0A0A',
            },
          },
        },
      },
      defaults: {
        global: { rounded: 0, elevation: 0 },
        VBtn: { rounded: 0, elevation: 0, variant: 'flat' },
        VCard: { rounded: 0, elevation: 0 },
        VTextField: { variant: 'outlined', rounded: 0 },
        VTextarea: { variant: 'outlined', rounded: 0 },
        VSelect: { variant: 'outlined', rounded: 0 },
        VAutocomplete: { variant: 'outlined', rounded: 0 },
        VDialog: { maxWidth: 640 },
      },
    },
  },
  i18n: {
    locales: [{ code: 'fr', file: 'fr.json' }],
  },
})
