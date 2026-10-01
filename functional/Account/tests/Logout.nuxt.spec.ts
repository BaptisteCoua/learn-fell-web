import 'fake-indexeddb/auto'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AccountMenuPanel from '../app/components/AccountMenuPanel.vue'
import { stubAccountApi } from './support/accountApi'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

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

let isOnline = true
Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => isOnline })

const CARD = { id: 1, box: 2, next_review_on: '2026-10-05' }

const signIn = () => {
  useSessionStore().user = {
    id: 7,
    display_name: 'Inès Martin',
    email: 'ines@exemple.fr',
    permissions: [],
    timezone: 'Europe/Paris',
  }
}

// Answers given offline, still on the device.
const answerOffline = async (count: number) => {
  isOnline = false
  const offlineReview = useOfflineReview()

  for (let index = 0; index < count; index += 1) {
    await offlineReview.recordAnswer({ ...CARD, id: index + 1 }, true)
  }
}

// The answers cannot reach the API; logging out still can.
const stubUnreachableAnswers = () =>
  stubAccountApi({
    '/card-progress/actions/answer': () => {
      throw new TypeError('Failed to fetch')
    },
    '/logout': () => undefined,
  })

// The dialog is teleported out of the panel; only the open one counts.
const dialogButton = (text: RegExp) =>
  [
    ...document.querySelectorAll<HTMLButtonElement>('.v-overlay--active .confirm-dialog button'),
  ].find((button) => text.test(button.textContent ?? ''))

const logoutButton = (panel: Awaited<ReturnType<typeof mountSuspended>>) =>
  panel.find('.account-menu-panel__logout')

describe('logging out', () => {
  beforeEach(async () => {
    isOnline = true
    navigateToMock.mockReset()
    stubAccountApi({})
    await useOfflineReview().discard()
    signIn()
  })

  afterEach(() => {
    isOnline = true
  })

  it('erases the review data of the device (US4-3, SC-004)', async () => {
    const apiFetch = stubAccountApi({ '/logout': () => undefined })
    const panel = await mountSuspended(AccountMenuPanel)

    await logoutButton(panel).trigger('click')

    await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledWith('/'))
    expect(apiFetch).toHaveBeenCalledWith('/logout', { method: 'POST' })
    expect(useOfflineReview().pendingCount.value).toBe(0)
    expect(useOfflineReview().pack.value).toBeNull()
  })

  it('sends the waiting answers first, then logs out without a warning', async () => {
    await answerOffline(1)
    isOnline = true
    const apiFetch = stubAccountApi({
      '/card-progress/actions/answer': () => ({ data: { impacted: 1 } }),
      '/logout': () => undefined,
    })
    const panel = await mountSuspended(AccountMenuPanel)

    await logoutButton(panel).trigger('click')

    await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledWith('/'))
    expect(apiFetch.mock.calls.map(([path]) => path)).toEqual([
      '/card-progress/actions/answer',
      '/logout',
    ])
  })

  it('warns when answers cannot leave, and lets the account wait (US4-2, FR-018)', async () => {
    await answerOffline(2)
    stubUnreachableAnswers()
    const panel = await mountSuspended(AccountMenuPanel)

    await logoutButton(panel).trigger('click')

    await vi.waitFor(() =>
      expect(document.querySelector('.v-overlay--active .confirm-dialog')?.textContent).toContain(
        '2 réponses ne sont pas encore envoyées.',
      ),
    )
    dialogButton(/Attendre le réseau/)?.click()

    await vi.waitFor(() =>
      expect(document.querySelector('.v-overlay--active .confirm-dialog')).toBeNull(),
    )
    expect(useSessionStore().isSignedIn).toBe(true)
    expect(useOfflineReview().pendingCount.value).toBe(2)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('logs out anyway when asked, losing the answers (FR-018, FR-004)', async () => {
    await answerOffline(1)
    const apiFetch = stubUnreachableAnswers()
    const panel = await mountSuspended(AccountMenuPanel)
    await logoutButton(panel).trigger('click')
    await vi.waitFor(() => expect(dialogButton(/Me déconnecter quand même/)).toBeDefined())

    dialogButton(/Me déconnecter quand même/)?.click()

    await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledWith('/'))
    expect(apiFetch).toHaveBeenCalledWith('/logout', { method: 'POST' })
    expect(useOfflineReview().pendingCount.value).toBe(0)
  })
})

describe('the account and the review data of the device', () => {
  beforeEach(async () => {
    await useOfflineReview().discard()
  })

  it('erases the data of another account when one logs in (US4-4)', async () => {
    signIn()
    await answerOffline(1)
    isOnline = true
    stubAccountApi({
      '/login': () => ({}),
      '/user': () => ({
        id: 8,
        display_name: 'Camille',
        email: 'camille@exemple.fr',
        permissions: [],
        timezone: 'Europe/Paris',
      }),
    })

    await useAuth().login('camille@exemple.fr', 'motdepasse')

    await vi.waitFor(() => expect(useOfflineReview().pendingCount.value).toBe(0))
  })

  it('erases the review data when the account asks to be deleted (edge case 004)', async () => {
    signIn()
    await answerOffline(1)
    stubAccountApi({ '/account/deletion': () => ({ erase_on: '2026-11-04' }) })

    await useAuth().requestAccountDeletion('motdepasse', null)

    expect(useOfflineReview().pendingCount.value).toBe(0)
  })
})
