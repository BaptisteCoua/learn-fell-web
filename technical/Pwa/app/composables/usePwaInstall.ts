/**
 * Installing CINQ on the home screen (FR-037). Chrome and Android hand over their own
 * install prompt; iPhone Safari has none, so it gets the three steps instead.
 */
export const usePwaInstall = () => {
  const nuxtApp = useNuxtApp()
  const { t } = useI18n()
  const { notify } = useToast()

  const isIosOpen = useState('pwa-ios-install-open', () => false)

  // `$pwa` is reactive: its refs come unwrapped, as plain values.
  // `$pwa` is reactive: its refs come unwrapped, as plain values.
  const pwa = computed(() => nuxtApp.$pwa)
  const isInstalled = computed(() => Boolean(pwa.value?.isPWAInstalled))
  const isIos = computed(
    () => import.meta.client && /iphone|ipad|ipod/i.test(navigator.userAgent) && !isInstalled.value,
  )
  // Offered from the account menu whenever installing is possible.
  const canInstall = computed(
    () => !isInstalled.value && (Boolean(pwa.value?.showInstallPrompt) || isIos.value),
  )
  const isNativePromptOpen = computed(
    () => Boolean(pwa.value?.showInstallPrompt) && !isInstalled.value,
  )

  const install = async (): Promise<void> => {
    if (isIos.value) {
      isIosOpen.value = true
      return
    }

    const choice = await pwa.value?.install()

    if (choice?.outcome === 'accepted') {
      notify(t('cinq is installed. find it on your home screen.'))
    }
  }

  const later = (): void => {
    pwa.value?.cancelInstall()
    isIosOpen.value = false
    notify(
      t('ok. you can install the application any time from account → install the application.'),
    )
  }

  const closeIos = (): void => {
    isIosOpen.value = false
  }

  return { canInstall, isNativePromptOpen, isIosOpen, install, later, closeIos }
}
