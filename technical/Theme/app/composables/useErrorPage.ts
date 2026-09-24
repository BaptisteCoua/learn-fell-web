import type { NuxtError } from '#app'

/**
 * The error page: a 404 reads as "content not found", anything else as a generic failure.
 * Leaving it clears the error before navigating.
 */
export const useErrorPage = (error: NuxtError) => {
  const isNotFound = computed(() => error.statusCode === 404)

  const leaveTo = async (path: string): Promise<void> => {
    await clearError({ redirect: path })
  }

  return { isNotFound, leaveTo }
}
