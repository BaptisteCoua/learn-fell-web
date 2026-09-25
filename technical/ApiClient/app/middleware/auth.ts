/**
 * Pages for signed-in accounts only; a visitor is sent to the login page and back after.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!useSessionStore().isSignedIn) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
})
