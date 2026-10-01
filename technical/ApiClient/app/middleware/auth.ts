declare module '#app' {
  interface PageMeta {
    availableOffline?: boolean
  }
}

/**
 * Pages for signed-in accounts only; a visitor is sent to the login page and back after.
 * A page that works offline opens when the API cannot be reached.
 */
export default defineNuxtRouteMiddleware((to) => {
  const sessionStore = useSessionStore()

  if (sessionStore.isUnreachable && to.meta.availableOffline) {
    return
  }

  if (!sessionStore.isSignedIn) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
})
