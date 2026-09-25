import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import LoginPage from '../app/pages/connexion.vue'
import { apiFailure, stubAccountApi } from './support/accountApi'

const fillAndSubmit = async (page: Awaited<ReturnType<typeof mountSuspended>>) => {
  await page.find('input[type="email"]').setValue('camille@exemple.fr')
  await page.find('input[type="password"]').setValue('motdepasse')
  await page.find('form').trigger('submit')
  await flushPromises()
}

describe('LoginPage', () => {
  beforeEach(() => {
    useSessionStore().clear()
  })

  it('offers Google as coming soon', async () => {
    stubAccountApi({})

    const page = await mountSuspended(LoginPage, { route: '/connexion' })

    const google = page.find('.google-soon__button')
    expect(google.attributes('disabled')).toBeDefined()
    expect(google.text()).toContain('Bientôt')
  })

  it('logs in with the device time zone and loads the account', async () => {
    const apiFetch = stubAccountApi({
      '/login': () => undefined,
      '/user': () => ({
        id: 1,
        display_name: 'Camille Roux',
        email: 'camille@exemple.fr',
        permissions: [],
      }),
    })

    const page = await mountSuspended(LoginPage, { route: '/connexion' })
    await fillAndSubmit(page)

    const loginCall = apiFetch.mock.calls.find(([path]) => path === '/login')
    expect(loginCall?.[1]?.body).toMatchObject({
      email: 'camille@exemple.fr',
      password: 'motdepasse',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    expect(useSessionStore().isSignedIn).toBe(true)
  })

  it('shows the generic message on wrong credentials', async () => {
    stubAccountApi({
      '/login': () => {
        throw apiFailure(422, {
          code: 'invalid_credentials',
          message: 'Adresse email ou mot de passe incorrect.',
        })
      },
    })

    const page = await mountSuspended(LoginPage, { route: '/connexion' })
    await fillAndSubmit(page)

    expect(page.find('[role="alert"]').text()).toContain('Adresse email ou mot de passe incorrect.')
  })

  it('offers to reset the password when the account is locked', async () => {
    stubAccountApi({
      '/login': () => {
        throw apiFailure(429, {
          code: 'locked',
          message: 'Trop de tentatives de connexion.',
          retry_after: 900,
        })
      },
    })

    const page = await mountSuspended(LoginPage, { route: '/connexion' })
    await fillAndSubmit(page)

    expect(page.text()).toContain('Trop de tentatives de connexion.')
    expect(page.find('[role="alert"] .v-btn').text()).toBe('Réinitialiser mon mot de passe')
  })

  it('sends a new confirmation link for an unconfirmed account', async () => {
    const apiFetch = stubAccountApi({
      '/login': () => {
        throw apiFailure(422, { code: 'email_not_verified', message: 'Non confirmée.' })
      },
      '/email/verification-notification': () => ({ message: 'ok' }),
    })

    const page = await mountSuspended(LoginPage, { route: '/connexion' })
    await fillAndSubmit(page)
    expect(page.text()).toContain("Votre adresse email n'est pas encore confirmée.")

    await page
      .findAll('button')
      .find((button) => button.text() === 'Renvoyer le lien')
      ?.trigger('click')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/email/verification-notification', {
      method: 'POST',
      body: { email: 'camille@exemple.fr' },
    })
    expect(page.text()).toContain('Consultez la boîte de camille@exemple.fr.')
  })
})
