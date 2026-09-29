import { describe, expect, it, vi } from 'vitest'
import SCRIPT from '../public/sw-push.js?raw'

type Listener = (event: Record<string, unknown>) => void

interface IWindowClient {
  url: string
  focus: ReturnType<typeof vi.fn>
  navigate: ReturnType<typeof vi.fn>
}

/**
 * Runs sw-push.js in a stand-in for the service worker global scope.
 */
const loadWorker = (openWindows: IWindowClient[] = []) => {
  const listeners: Record<string, Listener> = {}
  const showNotification = vi.fn(async () => undefined)
  const openWindow = vi.fn(async () => undefined)
  const worker = {
    location: { origin: 'https://app.cinq.test' },
    registration: { showNotification },
    clients: { matchAll: vi.fn(async () => openWindows), openWindow },
    addEventListener: (type: string, listener: Listener) => {
      listeners[type] = listener
    },
  }
  new Function('self', SCRIPT)(worker)

  const dispatch = async (type: string, event: Record<string, unknown>) => {
    let pending: Promise<unknown> = Promise.resolve()
    listeners[type]!({ ...event, waitUntil: (promise: Promise<unknown>) => (pending = promise) })
    await pending
  }

  return { dispatch, showNotification, openWindow }
}

const REMINDER = {
  title: 'CINQ',
  body: '12 cartes à réviser aujourd’hui',
  icon: '/icons/icon-192.png',
  badge: '/favicon-48.png',
  tag: 'review-reminder',
  data: { url: 'https://app.cinq.test/revisions/seance?sujets=1,2' },
}

const aClick = (close = vi.fn()) => ({ notification: { data: REMINDER.data, close } })

describe('sw-push.js', () => {
  it('shows the reminder it receives', async () => {
    const { dispatch, showNotification } = loadWorker()

    await dispatch('push', { data: { json: () => REMINDER } })

    expect(showNotification).toHaveBeenCalledWith('CINQ', {
      body: '12 cartes à réviser aujourd’hui',
      icon: '/icons/icon-192.png',
      badge: '/favicon-48.png',
      tag: 'review-reminder',
      data: { url: 'https://app.cinq.test/revisions/seance?sujets=1,2' },
      lang: 'fr',
    })
  })

  it('ignores a push without a message', async () => {
    const { dispatch, showNotification } = loadWorker()

    await dispatch('push', { data: null })

    expect(showNotification).not.toHaveBeenCalled()
  })

  it('brings an open tab of CINQ forward and takes it to the session', async () => {
    const tab = { url: 'https://app.cinq.test/categories', focus: vi.fn(), navigate: vi.fn() }
    const { dispatch, openWindow } = loadWorker([tab])
    const close = vi.fn()

    await dispatch('notificationclick', aClick(close))

    expect(close).toHaveBeenCalled()
    expect(tab.focus).toHaveBeenCalled()
    expect(tab.navigate).toHaveBeenCalledWith('https://app.cinq.test/revisions/seance?sujets=1,2')
    expect(openWindow).not.toHaveBeenCalled()
  })

  it('opens a new tab when CINQ is not open', async () => {
    const { dispatch, openWindow } = loadWorker([
      { url: 'https://elsewhere.test/', focus: vi.fn(), navigate: vi.fn() },
    ])

    await dispatch('notificationclick', aClick())

    expect(openWindow).toHaveBeenCalledWith('https://app.cinq.test/revisions/seance?sujets=1,2')
  })

  it('opens a new tab when the open one cannot be taken to the session', async () => {
    const tab = {
      url: 'https://app.cinq.test/categories',
      focus: vi.fn(),
      navigate: vi.fn(async () => {
        throw new TypeError('not controlled')
      }),
    }
    const { dispatch, openWindow } = loadWorker([tab])

    await dispatch('notificationclick', aClick())

    expect(openWindow).toHaveBeenCalledWith('https://app.cinq.test/revisions/seance?sujets=1,2')
  })
})
