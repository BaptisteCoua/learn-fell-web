/**
 * One fetch for every API call: laravel-raom-nuxt models and the Fortify account
 * endpoints alike. Sanctum SPA sessions need the session cookie, the XSRF header,
 * and — during SSR, once the browser has a session — its cookie and the front-end origin
 * forwarded to the API.
 */
export default defineNuxtPlugin({
  name: 'laravel-raom',
  setup() {
    const { apiBaseUrl } = useRuntimeConfig().public
    const apiOrigin = new URL(apiBaseUrl).origin
    const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
    const frontOrigin = import.meta.server ? useRequestURL().origin : window.location.origin

    const currentCookies = (): string =>
      import.meta.server ? (requestHeaders.cookie ?? '') : document.cookie

    const ensureXsrfCookie = async (): Promise<void> => {
      if (import.meta.client && readXsrfToken(currentCookies()) === null) {
        await $fetch('/sanctum/csrf-cookie', { baseURL: apiOrigin, credentials: 'include' })
      }
    }

    const apiFetch = $fetch.create({
      baseURL: apiBaseUrl,
      credentials: 'include',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      async onRequest({ options }) {
        if (isMutatingMethod(options.method)) {
          await ensureXsrfCookie()
        }

        const headers = new Headers(options.headers)
        const xsrfToken = readXsrfToken(currentCookies())

        if (xsrfToken !== null) {
          headers.set('X-XSRF-TOKEN', xsrfToken)
        }

        // A visitor's first page has no Sanctum session yet: calling as the front-end origin
        // would make Sanctum demand a CSRF token the server cannot have, so it calls as a guest.
        if (import.meta.server && xsrfToken !== null) {
          headers.set('Origin', frontOrigin)
          headers.set('Referer', `${frontOrigin}/`)

          if (requestHeaders.cookie) {
            headers.set('Cookie', requestHeaders.cookie)
          }
        }

        options.headers = headers
      },
    })

    return {
      provide: {
        laravelRaom: { fetch: apiFetch },
      },
    }
  },
})
