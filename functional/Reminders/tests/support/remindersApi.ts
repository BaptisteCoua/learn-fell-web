import { vi } from 'vitest'

// Vuetify's dialogs read the visual viewport, which happy-dom does not provide.
vi.stubGlobal('visualViewport', {
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  scale: 1,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
})

export interface IApiCall {
  path: string
  body: Record<string, unknown>
}

type Handler = (call: IApiCall) => unknown

export const aReminderSetting = (overrides: Record<string, unknown> = {}) => ({
  id: 3,
  email_enabled: false,
  send_time: '19:00',
  activated_at: null,
  proposal_seen_at: null,
  email_disabled_reason: null,
  next_reminder_at: null,
  devices_count: 0,
  ...overrides,
})

export const aDevice = (id: number, overrides: Record<string, unknown> = {}) => ({
  id,
  endpoint: `https://push.example.test/${id}`,
  device_label: 'Chrome sur Android',
  last_delivered_at: null,
  created_at: '2026-09-20T08:00:00Z',
  ...overrides,
})

/**
 * Replaces the API fetch; a search answers one page of what its handler returns.
 */
export const stubRemindersApi = (handlers: Record<string, Handler>) => {
  const calls: IApiCall[] = []
  const apiFetch = vi.fn(
    async (rawPath: string, options: { body?: string | Record<string, unknown> } = {}) => {
      const path = rawPath.replace(/^\//, '')
      const body =
        typeof options.body === 'string' ? JSON.parse(options.body) : (options.body ?? {})
      const call = { path, body }
      calls.push(call)
      const handler = handlers[path]

      if (!handler) {
        throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 })
      }

      const result = handler(call)

      return path.endsWith('/search')
        ? { data: result, current_page: 1, last_page: 1, total: (result as unknown[]).length }
        : result
    },
  )

  Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

  return calls
}

export const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'
export const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

const TEST_VAPID_PUBLIC_KEY =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

// Own properties shadow the prototype's getters, and keep the rest of happy-dom's navigator.
const setNavigator = (property: string, value: unknown): void => {
  Object.defineProperty(window.navigator, property, { value, configurable: true })
}

interface IPushBrowser {
  permission?: NotificationPermission
  currentEndpoint?: string | null
  userAgent?: string
}

/**
 * A browser with the Push and Notifications APIs. `requestPermission` answers `permission`,
 * and the current subscription, if any, has `currentEndpoint`.
 */
export const stubPushBrowser = ({
  permission = 'granted',
  currentEndpoint = null,
  userAgent = ANDROID_CHROME,
}: IPushBrowser = {}) => {
  const unsubscribe = vi.fn(async () => true)
  const subscriptionOf = (endpoint: string) => ({
    endpoint,
    unsubscribe,
    toJSON: () => ({ endpoint, keys: { p256dh: 'p256dh-key', auth: 'auth-key' } }),
  })
  let current = currentEndpoint === null ? null : subscriptionOf(currentEndpoint)
  const subscribe = vi.fn(async () => {
    current = subscriptionOf('https://push.example.test/new')
    return current
  })
  const requestPermission = vi.fn(async () => permission)

  vi.stubGlobal(
    'Notification',
    Object.assign(function Notification() {}, { permission: 'default', requestPermission }),
  )
  vi.stubGlobal('PushManager', function PushManager() {})
  const registration = { pushManager: { getSubscription: async () => current, subscribe } }
  setNavigator('userAgent', userAgent)
  setNavigator('serviceWorker', { getRegistration: async () => registration })
  useRuntimeConfig().public.vapidPublicKey = TEST_VAPID_PUBLIC_KEY

  return { requestPermission, subscribe, unsubscribe }
}

/**
 * A browser that could show notifications, but without the service worker of the production
 * build, as under `pnpm dev`.
 */
export const stubBrowserWithoutServiceWorker = () => {
  const push = stubPushBrowser()
  setNavigator('serviceWorker', { getRegistration: async () => undefined })

  return push
}

/**
 * A browser without the Push API, such as Safari on an iPhone outside the installed app.
 */
export const stubBrowserWithoutPush = (userAgent: string) => {
  vi.stubGlobal('Notification', undefined)
  vi.stubGlobal('PushManager', undefined)
  setNavigator('userAgent', userAgent)
  setNavigator('serviceWorker', undefined)
}

export const signIn = () => {
  useSessionStore().user = {
    id: 7,
    display_name: 'Inès Martin',
    email: 'ines@exemple.fr',
    permissions: [],
  }
}
