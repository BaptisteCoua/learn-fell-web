import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ConfirmationPage from '../app/pages/inscription/confirmation.vue'
import { apiFailure, stubAccountApi } from './support/accountApi'

const LINK =
  '/inscription/confirmation?id=17&hash=abc&expires=1790405502&nonce=n0nce&signature=s1gn'

describe('ConfirmationPage', () => {
  beforeEach(() => {
    useSessionStore().clear()
  })

  it('asks to check the inbox and sends the link again', async () => {
    const apiFetch = stubAccountApi({
      '/email/verification-notification': () => ({ message: 'ok' }),
    })

    const page = await mountSuspended(ConfirmationPage, {
      route: '/inscription/confirmation?email=camille@exemple.fr',
    })
    expect(page.text()).toContain('Vérifiez vos emails')
    expect(page.text()).toContain('camille@exemple.fr')

    await page
      .findAll('button')
      .find((button) => button.text() === "Renvoyer l'email")
      ?.trigger('click')
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/email/verification-notification', {
      method: 'POST',
      body: { email: 'camille@exemple.fr' },
    })
    expect(page.text()).toContain('Le précédent ne fonctionne plus.')
  })

  it('confirms the address from the email link and logs the account in', async () => {
    const apiFetch = stubAccountApi({
      '/email/verify/17/abc': () => undefined,
      '/user': () => ({
        id: 17,
        display_name: 'Camille Roux',
        email: 'camille@exemple.fr',
        permissions: [],
      }),
    })

    const page = await mountSuspended(ConfirmationPage, { route: LINK })
    await flushPromises()

    expect(apiFetch).toHaveBeenCalledWith('/email/verify/17/abc', {
      query: { expires: '1790405502', nonce: 'n0nce', signature: 's1gn' },
    })
    expect(page.text()).toContain('Adresse confirmée')
    expect(page.text()).toContain('Bienvenue, Camille Roux.')
  })

  it('reports an expired link and offers a new one', async () => {
    stubAccountApi({
      '/email/verify/17/abc': () => {
        throw apiFailure(403, { code: 'link_expired', message: 'Ce lien a expiré.' })
      },
    })

    const page = await mountSuspended(ConfirmationPage, { route: LINK })
    await flushPromises()

    expect(page.text()).toContain('Lien expiré')
    expect(page.find('input[type="email"]').exists()).toBe(true)
  })
})
