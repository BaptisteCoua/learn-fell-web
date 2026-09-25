/**
 * A new version is ready (FR-040): update now, or keep reading and update later.
 */
export const usePwaUpdate = () => {
  const nuxtApp = useNuxtApp()

  // `$pwa` is reactive: `needRefresh` comes unwrapped, as a boolean.
  const isAvailable = computed(() => Boolean(nuxtApp.$pwa?.needRefresh))

  const update = async (): Promise<void> => {
    await nuxtApp.$pwa?.updateServiceWorker(true)
  }

  const later = async (): Promise<void> => {
    await nuxtApp.$pwa?.cancelPrompt()
  }

  return { isAvailable, update, later }
}
