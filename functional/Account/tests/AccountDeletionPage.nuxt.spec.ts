import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccountMenuPanel from '../app/components/AccountMenuPanel.vue'
import AccountDeletedPage from '../app/pages/compte-supprime.vue'
import AccountDeletionPage from '../app/pages/supprimer-mon-compte.vue'
import { apiFailure, stubAccountApi } from './support/accountApi'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

mockNuxtImport('navigateTo', () => navigateToMock)

const STATE = { can_request: true, blocked_reason: null, erase_on: '2026-10-31' }

const signIn = () => {
  useSessionStore().user = {
    id: 7,
    display_name: 'Inès Martin',
    email: 'ines@exemple.fr',
    permissions: [],
  }
}

const confirmWith = async (page: Awaited<ReturnType<typeof mountSuspended>>, password: string) => {
  await page.find('input[type="password"]').setValue(password)
  await page.find('form').trigger('submit')
  await flushPromises()
}

describe('AccountDeletionPage', () => {
  beforeEach(() => {
    navigateToMock.mockReset()
    signIn()
  })

  it('is reached from the account menu', async () => {
    const panel = await mountSuspended(AccountMenuPanel)

    const link = panel.findAll('a').find((item) => item.text() === 'Supprimer mon compte')
    expect(link?.attributes('href')).toBe('/supprimer-mon-compte')
  })

  it('says what is erased, what is kept, and when', async () => {
    stubAccountApi({ '/account/deletion': () => STATE })

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })

    expect(page.text()).toContain('Tout est effacé le 31 octobre 2026')
    expect(page.text()).toContain('Votre nom affiché et votre adresse email')
    expect(page.text()).toContain('Vos signalements et vos décisions de modération')
  })

  it('shows a wrong password under the field', async () => {
    stubAccountApi({
      '/account/deletion': ({ method }) => {
        if (method === 'POST') {
          throw apiFailure(422, { errors: { password: ['Mot de passe incorrect.'] } })
        }

        return STATE
      },
    })

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })
    await confirmWith(page, 'mauvais')

    expect(page.text()).toContain('Mot de passe incorrect.')
    expect(useSessionStore().isSignedIn).toBe(true)
  })

  it('logs out and opens the confirmation once the request is made', async () => {
    const apiFetch = stubAccountApi({
      '/account/deletion': ({ method }) => (method === 'POST' ? { erase_on: '2026-10-31' } : STATE),
    })

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })
    await confirmWith(page, 'motdepasse')

    const request = apiFetch.mock.calls.find(([, options]) => options?.method === 'POST')
    expect(request?.[1]?.body).toEqual({ password: 'motdepasse', keep_published_subjects: null })
    expect(useSessionStore().isSignedIn).toBe(false)
    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/compte-supprime',
      query: { le: '2026-10-31' },
    })
  })

  it('gives the erasure date on the confirmation page', async () => {
    const page = await mountSuspended(AccountDeletedPage, {
      route: '/compte-supprime?le=2026-10-31',
    })

    expect(page.text()).toContain('Votre compte sera effacé le 31 octobre 2026.')
    expect(page.text()).toContain('Reconnectez-vous avant le 31 octobre 2026')
  })
})
