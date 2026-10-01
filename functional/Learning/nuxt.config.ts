export default defineNuxtConfig({
  imports: { dirs: ['models'] },
  // The review pages open without the network: rendered on the device from one shell that
  // the service worker keeps (006, research R8).
  routeRules: {
    '/revisions': { ssr: false, prerender: true },
    '/revisions/**': { ssr: false },
  },
  i18n: {
    locales: [{ code: 'fr', file: 'fr.json' }],
  },
})
