// In production the front and the API sit on different *.up.railway.app hosts,
// which the browser treats as cross-site — a Sanctum session cookie set by the
// API would be third-party and dropped (Safari/iOS block it outright). So the
// browser only ever talks to the front's own origin: Nitro proxies /api and
// /sanctum to the API over Railway's private network, keeping the cookie
// first-party. Set NUXT_API_INTERNAL_URL (e.g. http://api.railway.internal:8080)
// to turn the proxy on; left unset, dev keeps talking to the API directly.
const apiInternalUrl = process.env.NUXT_API_INTERNAL_URL

export default defineNuxtConfig({
  modules: ['laravel-raom-nuxt'],
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8090/api',
    },
  },
  ...(apiInternalUrl
    ? {
        nitro: {
          routeRules: {
            '/api/**': { proxy: `${apiInternalUrl}/api/**` },
            '/sanctum/**': { proxy: `${apiInternalUrl}/sanctum/**` },
          },
        },
      }
    : {}),
  i18n: {
    locales: [{ code: 'fr', file: 'fr.json' }],
  },
})
