/**
 * Pages that make no sense once signed in (login, registration).
 */
export default defineNuxtRouteMiddleware(() => {
  if (useSessionStore().isSignedIn) {
    return navigateTo('/')
  }
})
