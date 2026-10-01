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
const NO_SUBJECT = { published_subjects_count: 0, learners_count: 0 }
const TWO_SUBJECTS = { published_subjects_count: 2, learners_count: 37 }

/**
 * The two reads of the screen, and the request: `onRequest` answers the POST.
 */
const stubDeletion = (
  summary: typeof NO_SUBJECT = NO_SUBJECT,
  onRequest: () => unknown = () => ({ erase_on: '2026-10-31' }),
  state: Record<string, unknown> = STATE,
) =>
  stubAccountApi({
    '/account/deletion': ({ method }) => (method === 'POST' ? onRequest() : state),
    '/learning/authored-subjects-summary': () => summary,
  })

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

const postedBody = (apiFetch: ReturnType<typeof stubDeletion>) =>
  apiFetch.mock.calls.find(([, options]) => options?.method === 'POST')?.[1]?.body

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
    stubDeletion()

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })

    expect(page.text()).toContain('Tout est effacé le 31 octobre 2026')
    expect(page.text()).toContain('Votre nom affiché et votre adresse email')
    expect(page.text()).toContain('Vos signalements et vos décisions de modération')
    expect(page.text()).not.toContain('Que deviennent vos sujets publiés ?')
  })

  it('shows a wrong password under the field', async () => {
    stubDeletion(NO_SUBJECT, () => {
      throw apiFailure(422, { errors: { password: ['Mot de passe incorrect.'] } })
    })

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })
    await confirmWith(page, 'mauvais')

    expect(page.text()).toContain('Mot de passe incorrect.')
    expect(useSessionStore().isSignedIn).toBe(true)
  })

  it('logs out and opens the confirmation once the request is made', async () => {
    const apiFetch = stubDeletion()

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })
    await confirmWith(page, 'motdepasse')

    expect(postedBody(apiFetch)).toEqual({ password: 'motdepasse', keep_published_subjects: null })
    expect(useSessionStore().isSignedIn).toBe(false)
    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/compte-supprime',
      query: { le: '2026-10-31' },
    })
  })

  it('makes an author of published subjects choose, with the numbers at hand', async () => {
    const apiFetch = stubDeletion(TWO_SUBJECTS)

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })
    expect(page.text()).toContain('2 sujets publiés, appris par 37 personnes.')

    await confirmWith(page, 'motdepasse')
    expect(page.text()).toContain('Choisissez ce que deviennent vos sujets publiés.')
    expect(postedBody(apiFetch)).toBeUndefined()

    await page.find('input[value="keep"]').setValue(true)
    await confirmWith(page, 'motdepasse')
    expect(postedBody(apiFetch)).toEqual({ password: 'motdepasse', keep_published_subjects: true })
  })

  it('sends « Tout effacer » as not keeping the subjects', async () => {
    const apiFetch = stubDeletion(TWO_SUBJECTS)

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })
    await page.find('input[value="erase"]').setValue(true)
    await confirmWith(page, 'motdepasse')

    expect(postedBody(apiFetch)).toEqual({ password: 'motdepasse', keep_published_subjects: false })
  })

  it('explains why the last administrator cannot leave', async () => {
    stubDeletion(NO_SUBJECT, undefined, {
      can_request: false,
      blocked_reason: 'last_admin',
      erase_on: '2026-10-31',
    })

    const page = await mountSuspended(AccountDeletionPage, { route: '/supprimer-mon-compte' })

    expect(page.text()).toContain("Votre compte ne peut pas être supprimé pour l'instant.")
    expect(page.find('input[type="password"]').exists()).toBe(false)
    expect(page.find('button[type="submit"]').exists()).toBe(false)
  })

  it('gives the erasure date on the confirmation page', async () => {
    const page = await mountSuspended(AccountDeletedPage, {
      route: '/compte-supprime?le=2026-10-31',
    })

    expect(page.text()).toContain('Votre compte sera effacé le 31 octobre 2026.')
    expect(page.text()).toContain('Reconnectez-vous avant le 31 octobre 2026')
  })
})
