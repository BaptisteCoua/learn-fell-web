import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  css: [fileURLToPath(new URL('./app/assets/account.scss', import.meta.url))],
  i18n: {
    locales: [{ code: 'fr', file: 'fr.json' }],
  },
})
