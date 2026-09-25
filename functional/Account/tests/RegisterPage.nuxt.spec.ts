import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import RegisterPage from '../app/pages/inscription/index.vue'
import { apiFailure, stubAccountApi } from './support/accountApi'

const fill = async (
  page: Awaited<ReturnType<typeof mountSuspended>>,
  confirmation = 'motdepasse',
) => {
  const inputs = page.findAll('input')
  await inputs[0]?.setValue('Camille Roux')
  await inputs[1]?.setValue('camille@exemple.fr')
  await inputs[2]?.setValue('motdepasse')
  await inputs[3]?.setValue(confirmation)
  await page.find('form').trigger('submit')
  await flushPromises()
}

describe('RegisterPage', () => {
  beforeEach(() => {
    useSessionStore().clear()
  })

  it('refuses two different passwords without calling the API', async () => {
    const apiFetch = stubAccountApi({ '/register': () => undefined })

    const page = await mountSuspended(RegisterPage, { route: '/inscription' })
    await fill(page, 'autrechose')

    expect(page.text()).toContain('Les deux mots de passe ne correspondent pas.')
    expect(apiFetch.mock.calls.some(([path]) => path === '/register')).toBe(false)
  })

  it('sends the registration with the device time zone', async () => {
    const apiFetch = stubAccountApi({ '/register': () => ({ message: 'ok' }) })

    const page = await mountSuspended(RegisterPage, { route: '/inscription' })
    await fill(page)

    expect(apiFetch.mock.calls.find(([path]) => path === '/register')?.[1]?.body).toEqual({
      display_name: 'Camille Roux',
      email: 'camille@exemple.fr',
      password: 'motdepasse',
      password_confirmation: 'motdepasse',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  })

  it('invites to log in when the address has an active account', async () => {
    stubAccountApi({
      '/register': () => {
        throw apiFailure(422, { code: 'email_taken', message: 'Un compte existe déjà.' })
      },
    })

    const page = await mountSuspended(RegisterPage, { route: '/inscription' })
    await fill(page)

    const conflict = page.find('.account-form__conflict')
    expect(conflict.text()).toContain('Cette adresse a déjà un compte.')
    expect(conflict.find('a[href="/connexion"]').exists()).toBe(true)
  })

  it('offers a new confirmation link when the account waits for confirmation', async () => {
    stubAccountApi({
      '/register': () => {
        throw apiFailure(422, { code: 'email_pending_verification', message: 'En attente.' })
      },
    })

    const page = await mountSuspended(RegisterPage, { route: '/inscription' })
    await fill(page)

    expect(page.find('.account-form__conflict a').attributes('href')).toBe(
      '/inscription/confirmation?email=camille@exemple.fr',
    )
  })

  it('shows the validation message under its field', async () => {
    stubAccountApi({
      '/register': () => {
        throw apiFailure(422, {
          message: 'Le champ mot de passe doit contenir au moins 8 caractères.',
          errors: { password: ['Le champ mot de passe doit contenir au moins 8 caractères.'] },
        })
      },
    })

    const page = await mountSuspended(RegisterPage, { route: '/inscription' })
    await fill(page)

    expect(page.text()).toContain('Le champ mot de passe doit contenir au moins 8 caractères.')
  })
})
