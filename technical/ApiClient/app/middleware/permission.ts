declare module '#app' {
  interface PageMeta {
    permission?: string
  }
}

/**
 * Pages that need a permission (`definePageMeta({ middleware: 'permission', permission })`).
 * Without it the page is reported as not found, so its existence is not revealed.
 */
export default defineNuxtRouteMiddleware((to) => {
  const sessionStore = useSessionStore()
  const permission = to.meta.permission

  if (!sessionStore.isSignedIn) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }

  if (permission && !sessionStore.can(permission)) {
    return abortNavigation(createError({ statusCode: 404 }))
  }
})
