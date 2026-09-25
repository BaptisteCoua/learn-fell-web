/**
 * Whether the device is online (FR-039): a banner while offline, a confirmation on return.
 */
export const useConnectionStatus = () => {
  const { t } = useI18n()
  const { notify } = useToast()

  const isOffline = ref(false)

  const goOffline = (): void => {
    isOffline.value = true
  }

  const goOnline = (): void => {
    if (isOffline.value) {
      notify(t('you are online again.'))
    }

    isOffline.value = false
  }

  onMounted(() => {
    isOffline.value = !navigator.onLine
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('offline', goOffline)
    window.removeEventListener('online', goOnline)
  })

  return { isOffline }
}
