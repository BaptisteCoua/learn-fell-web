export default defineNuxtConfig({
  imports: { dirs: ['models'] },
  runtimeConfig: {
    public: {
      // The back's VAPID_PUBLIC_KEY, given as NUXT_PUBLIC_VAPID_PUBLIC_KEY (research R2).
      vapidPublicKey: '',
    },
  },
  i18n: {
    locales: [{ code: 'fr', file: 'fr.json' }],
  },
})
