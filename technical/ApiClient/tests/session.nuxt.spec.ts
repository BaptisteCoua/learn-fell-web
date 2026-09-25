import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetch = vi.fn()

mockNuxtImport('useApiFetch', () => () => apiFetch)

describe('useSessionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiFetch.mockReset()
  })

  it('loads the signed-in account and answers permission checks', async () => {
    apiFetch.mockResolvedValue({
      id: 1,
      display_name: 'Camille Roux',
      email: 'camille@exemple.fr',
      permissions: ['categories.manage'],
    })
    const sessionStore = useSessionStore()

    await sessionStore.fetchUser()

    expect(apiFetch).toHaveBeenCalledWith('/user')
    expect(sessionStore.isSignedIn).toBe(true)
    expect(sessionStore.initials).toBe('CR')
    expect(sessionStore.can('categories.manage')).toBe(true)
    expect(sessionStore.can('subjects.moderate')).toBe(false)
  })

  it('treats a 401 as a visitor', async () => {
    apiFetch.mockRejectedValue(Object.assign(new Error('Unauthenticated'), { statusCode: 401 }))
    const sessionStore = useSessionStore()

    await sessionStore.fetchUser()

    expect(sessionStore.isSignedIn).toBe(false)
    expect(sessionStore.isLoaded).toBe(true)
    expect(sessionStore.can('categories.manage')).toBe(false)
  })

  it('forgets the account on clear', async () => {
    apiFetch.mockResolvedValue({ id: 1, display_name: 'Inès', email: 'i@e.fr', permissions: [] })
    const sessionStore = useSessionStore()
    await sessionStore.fetchUser()

    sessionStore.clear()

    expect(sessionStore.user).toBeNull()
  })
})

describe('readXsrfToken', () => {
  it('reads and decodes the XSRF cookie', () => {
    expect(readXsrfToken('a=1; XSRF-TOKEN=abc%3D%3D; b=2')).toBe('abc==')
    expect(readXsrfToken('a=1')).toBeNull()
  })

  it('knows which methods change something', () => {
    expect(isMutatingMethod('POST')).toBe(true)
    expect(isMutatingMethod('get')).toBe(false)
    expect(isMutatingMethod(undefined)).toBe(false)
  })
})
