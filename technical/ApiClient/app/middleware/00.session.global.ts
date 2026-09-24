/**
 * Loads the session once per visit, before the first page renders (during SSR when
 * possible), so the first paint already shows the right header: visitor, member or admin.
 */
export default defineNuxtRouteMiddleware(async () => {
  const sessionStore = useSessionStore()

  if (!sessionStore.isLoaded) {
    await sessionStore.fetchUser()
  }
})
