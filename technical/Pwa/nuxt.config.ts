export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-48.png' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      ],
      meta: [{ name: 'theme-color', content: '#FACC15' }],
      // The address asked for, noted before Nuxt starts: when the service worker answers with
      // the offline page, hydrating it rewrites the address bar to /hors-ligne.
      script: [{ innerHTML: 'window.__cinqRequestedUrl = window.location.href' }],
    },
  },
  // The offline page is served by the service worker, so it must exist as a file.
  nitro: {
    prerender: { routes: ['/hors-ligne'] },
  },
  pwa: {
    // A new version waits for "Mettre à jour" instead of reloading under the reader (FR-040).
    registerType: 'prompt',
    manifest: {
      name: 'CINQ',
      short_name: 'CINQ',
      description: 'Apprenez tout, retenez tout, avec la méthode Leitner.',
      theme_color: '#FACC15',
      background_color: '#FFFBEB',
      lang: 'fr',
      display: 'standalone',
      orientation: 'any',
      start_url: '/categories',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // Pages are rendered by the server: no app shell for every navigation, only a fallback
      // when the network is gone (FR-039). Subjects are not readable offline in 001.
      navigateFallback: null,
      // The prerendered offline page is precached as `hors-ligne`.
      globPatterns: ['**/*.{js,css,png,svg,ico,woff2}', 'hors-ligne/index.html'],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkOnly',
          options: { precacheFallback: { fallbackURL: '/hors-ligne' } },
        },
        {
          // The French texts, so that the offline page still reads in French once hydrated.
          urlPattern: ({ url }) => url.pathname.startsWith('/_i18n/'),
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'cinq-i18n' },
        },
        {
          // The API is never answered from a cache: reviews and sessions must be current.
          urlPattern: ({ url }) =>
            url.pathname.startsWith('/api/') || url.pathname.startsWith('/sanctum/'),
          handler: 'NetworkOnly',
        },
      ],
    },
    client: {
      // "Plus tard" on the install invitation is remembered under this key.
      installPrompt: 'cinq-install-later',
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
    },
  },
  i18n: {
    locales: [{ code: 'fr', file: 'fr.json' }],
  },
})
