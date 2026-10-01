import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RegisterPage from '../app/pages/inscription/index.vue'
import { apiFailure, stubAccountApi } from './support/accountApi'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

mockNuxtImport('navigateTo', () => navigateToMock)

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
    navigateToMock.mockReset()
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

  it('always leads to the check-your-emails page, saying nothing of the address', async () => {
    stubAccountApi({
      '/register': () => ({
        message:
          "Si cette adresse peut être utilisée, un lien de confirmation vient d'y être envoyé.",
      }),
    })

    const page = await mountSuspended(RegisterPage, { route: '/inscription' })
    await fill(page)

    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/inscription/confirmation',
      query: { email: 'camille@exemple.fr' },
    })
    expect(page.text()).not.toContain('déjà un compte')
    expect(page.text()).not.toContain('attente de confirmation')
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
