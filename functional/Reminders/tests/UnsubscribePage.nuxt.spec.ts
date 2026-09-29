import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import UnsubscribePage from '../app/pages/rappels/desinscription.vue'
import { stubRemindersApi } from './support/remindersApi'

const LINK = '/rappels/desinscription?id=7&v=2&signature=abc123'

const invalidLink = () =>
  Object.assign(new Error('invalid_link'), {
    statusCode: 403,
    data: { code: 'invalid_link', message: 'Ce lien n’est pas valide.' },
  })

const openLink = async (route: string) => {
  const page = await mountSuspended(UnsubscribePage, { route })
  await flushPromises()

  return page
}

/**
 * FR-014, FR-016 — user story 4: the page a reminder email links to, without a session.
 */
describe('UnsubscribePage', () => {
  beforeEach(() => {
    useSessionStore().clear()
  })

  it('turns the reminder emails off with the signed parameters of the link', async () => {
    const calls = stubRemindersApi({ 'reminders/unsubscribe/7': () => undefined })

    const page = await openLink(LINK)

    expect(calls).toEqual([
      { path: 'reminders/unsubscribe/7', body: {}, query: { v: '2', signature: 'abc123' } },
    ])
    expect(page.text()).toContain('Vous ne recevrez plus les rappels par email.')
    const manage = page
      .findAllComponents({ name: 'VBtn' })
      .find((button) => button.text() === 'Gérer mes rappels')
    expect(manage?.props('to')).toBe('/compte#rappels')
  })

  it('says that the link is not valid, without telling whose it is', async () => {
    stubRemindersApi({
      'reminders/unsubscribe/7': () => {
        throw invalidLink()
      },
    })

    const page = await openLink(LINK)

    expect(page.text()).toContain('Ce lien n’est pas valide.')
    expect(page.text()).not.toContain('Vous ne recevrez plus les rappels par email.')
  })

  it('does not call the API for an incomplete link', async () => {
    const calls = stubRemindersApi({})

    const page = await openLink('/rappels/desinscription?id=7')

    expect(calls).toEqual([])
    expect(page.text()).toContain('Ce lien n’est pas valide.')
  })

  it('offers to try again after a network failure', async () => {
    let attempts = 0
    stubRemindersApi({
      'reminders/unsubscribe/7': () => {
        attempts += 1
        if (attempts === 1) {
          throw Object.assign(new Error('offline'), { statusCode: 0 })
        }
      },
    })

    const page = await openLink(LINK)
    await page
      .findAll('button')
      .find((button) => button.text().includes('Réessayer'))
      ?.trigger('click')
    await flushPromises()

    expect(attempts).toBe(2)
    expect(page.text()).toContain('Vous ne recevrez plus les rappels par email.')
  })
})
