import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import authMiddleware from '../../../technical/ApiClient/app/middleware/auth'
import LoginPage from '../../Account/app/pages/connexion.vue'
import { stubAccountApi } from '../../Account/tests/support/accountApi'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

mockNuxtImport('navigateTo', () => navigateToMock)

const SESSION_LINK = '/revisions/seance?sujets=1,2'

/**
 * FR-010 (002) — the session link of a reminder, opened without being logged in.
 */
describe('the session link of a reminder', () => {
  beforeEach(() => {
    navigateToMock.mockReset()
    useSessionStore().clear()
  })

  it('sends a visitor to the login page, remembering the session', async () => {
    const to = useRouter().resolve(SESSION_LINK)

    await authMiddleware(to, to)

    expect(navigateToMock).toHaveBeenCalledWith({
      path: '/connexion',
      query: { redirect: to.fullPath },
    })
    expect(useRouter().resolve(to.fullPath).query).toEqual({ sujets: '1,2' })
  })

  it('opens the session once logged in', async () => {
    stubAccountApi({
      '/login': () => undefined,
      '/user': () => ({ id: 7, display_name: 'Inès', email: 'ines@exemple.fr', permissions: [] }),
    })
    const page = await mountSuspended(LoginPage, {
      route: `/connexion?redirect=${encodeURIComponent(SESSION_LINK)}`,
    })

    await page.find('input[type="email"]').setValue('ines@exemple.fr')
    await page.find('input[type="password"]').setValue('motdepasse')
    await page.find('form').trigger('submit')
    await flushPromises()

    expect(navigateToMock).toHaveBeenCalledWith(SESSION_LINK)
  })
})
