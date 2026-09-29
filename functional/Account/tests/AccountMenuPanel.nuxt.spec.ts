import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AccountMenuPanel from '../app/components/AccountMenuPanel.vue'

describe('AccountMenuPanel', () => {
  it('leads to the review reminders of the account page', async () => {
    useSessionStore().user = {
      id: 7,
      display_name: 'Inès Martin',
      email: 'ines@exemple.fr',
      permissions: [],
    }

    const panel = await mountSuspended(AccountMenuPanel)

    const link = panel.findAll('a').find((item) => item.text() === 'Rappels de révision')
    expect(link?.attributes('href')).toBe('/compte#rappels')
  })
})
