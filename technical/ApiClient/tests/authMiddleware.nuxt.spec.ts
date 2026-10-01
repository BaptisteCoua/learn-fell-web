import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import auth from '../app/middleware/auth'

const routeTo = (availableOffline: boolean) =>
  ({
    fullPath: '/revisions',
    meta: availableOffline ? { availableOffline } : {},
  }) as unknown as RouteLocationNormalized

const run = (availableOffline: boolean) =>
  auth(routeTo(availableOffline), routeTo(availableOffline))

describe('the auth middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('opens a page that works offline when the API cannot be reached', () => {
    useSessionStore().isUnreachable = true

    expect(run(true)).toBeUndefined()
  })

  it('sends to the login page any other page when the API cannot be reached', () => {
    useSessionStore().isUnreachable = true

    expect(run(false)).toBeTruthy()
  })

  it('sends a visitor to the login page, even for a page that works offline', () => {
    expect(run(true)).toBeTruthy()
  })
})
