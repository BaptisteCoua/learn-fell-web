import type { IBrowserIdentity } from '../utils/detectDevice'

export type PushDeviceProblem = 'denied' | 'failed' | null

const DEVICE_LABEL_MAX_LENGTH = 60

interface INavigatorWithHints extends Navigator {
  userAgentData?: IBrowserIdentity['userAgentData']
}

/**
 * This browser as a device that shows the reminders (research R11): whether it can, asking
 * its permission, subscribing it to the push service and recognising it in the list.
 */
export const usePushDevice = () => {
  const { t } = useI18n()
  const { vapidPublicKey } = useRuntimeConfig().public
  const { isIos } = usePwaInstall()

  const problem = ref<PushDeviceProblem>(null)
  const currentEndpoint = ref<string | null>(null)
  const isReady = ref(false)

  const isSupported = computed(
    () =>
      import.meta.client &&
      'serviceWorker' in navigator &&
      navigator.serviceWorker !== undefined &&
      typeof window.PushManager !== 'undefined' &&
      typeof window.Notification !== 'undefined',
  )
  // iPhone and iPad show notifications only once CINQ is on the home screen (FR-005).
  const needsInstall = computed(() => isIos.value && !isSupported.value)

  const isCurrent = (device: PushSubscription): boolean =>
    currentEndpoint.value !== null && device.endpoint === currentEndpoint.value

  const registration = async (): Promise<ServiceWorkerRegistration | undefined> =>
    isSupported.value ? navigator.serviceWorker.getRegistration() : undefined

  /**
   * Whether this browser can be subscribed now, and which device of the list it is. Besides the
   * browser's APIs, it takes the service worker of the production build and the VAPID key.
   */
  const inspect = async (): Promise<void> => {
    const serviceWorker = await registration()
    const subscription = await serviceWorker?.pushManager.getSubscription()

    isReady.value = serviceWorker !== undefined && vapidPublicKey !== ''
    currentEndpoint.value = subscription?.endpoint ?? null
  }

  const label = (): string => {
    const { browser, system } = detectDevice(navigator as INavigatorWithHints)
    const name =
      browser && system
        ? t('{browser} on {system}', { browser, system })
        : (browser ?? system ?? t('browser'))

    return name.slice(0, DEVICE_LABEL_MAX_LENGTH)
  }

  const contentEncoding = (): string => {
    const supported = (PushManager as { supportedContentEncodings?: string[] })
      .supportedContentEncodings

    return !supported || supported.includes('aes128gcm') ? 'aes128gcm' : 'aesgcm'
  }

  /**
   * Nothing is recorded unless the browser allows the notifications (FR-004).
   */
  const enable = async (): Promise<boolean> => {
    problem.value = null

    if ((await Notification.requestPermission()) !== 'granted') {
      problem.value = 'denied'
      return false
    }

    try {
      const pushManager = (await registration())?.pushManager

      if (!pushManager) {
        throw new Error('No service worker')
      }

      const subscription =
        (await pushManager.getSubscription()) ??
        (await pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey(vapidPublicKey),
        }))
      const keys = subscription.toJSON().keys ?? {}

      await PushSubscription.actions('register-device', [
        { name: 'endpoint', value: subscription.endpoint },
        { name: 'public_key', value: keys.p256dh },
        { name: 'auth_token', value: keys.auth },
        { name: 'content_encoding', value: contentEncoding() },
        { name: 'device_label', value: label() },
      ])
      currentEndpoint.value = subscription.endpoint

      return true
    } catch {
      problem.value = 'failed'
      return false
    }
  }

  /**
   * The current browser also leaves the push service; another device simply stops receiving.
   */
  const forget = async (device: PushSubscription): Promise<void> => {
    if (!isCurrent(device)) {
      return
    }

    const subscription = await (await registration())?.pushManager.getSubscription()
    await subscription?.unsubscribe()
    currentEndpoint.value = null
  }

  return { problem, isSupported, isReady, needsInstall, isCurrent, inspect, enable, forget }
}
