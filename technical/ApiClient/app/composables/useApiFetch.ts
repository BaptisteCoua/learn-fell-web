/**
 * The configured API fetch (session cookie, XSRF header, SSR forwarding), for the few
 * calls that are not lomkit resources: Fortify account endpoints and GET /user.
 */
export const useApiFetch = () => useNuxtApp().$laravelRaom.fetch
