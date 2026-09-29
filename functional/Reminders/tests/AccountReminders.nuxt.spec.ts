import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import AccountReminders from '../app/components/AccountReminders.vue'
import {
  aDevice,
  aReminderSetting,
  IPHONE_SAFARI,
  signIn,
  stubBrowserWithoutPush,
  stubPushBrowser,
  stubRemindersApi,
  type IApiCall,
} from './support/remindersApi'

type Section = Awaited<ReturnType<typeof mountSuspended>>

const mountSection = async ({ setting = {}, devices = [] as Record<string, unknown>[] } = {}) => {
  let registered = devices
  const calls = stubRemindersApi({
    'reminder-settings/search': () => [aReminderSetting(setting)],
    'reminder-settings/mutate': () => ({ data: { created: [], updated: [3] } }),
    'push-subscriptions/search': () => registered,
    'push-subscriptions/actions/register-device': () => {
      registered = [aDevice(9, { endpoint: 'https://push.example.test/new' }), ...registered]
      return { data: { impacted: 0 } }
    },
    'push-subscriptions': (call: IApiCall) => {
      const [id] = call.body.resources as number[]
      registered = registered.filter((device) => device.id !== id)
      return { data: [] }
    },
  })
  const section = await mountSuspended(AccountReminders)
  await flushPromises()

  return { section, calls }
}

const button = (section: Section, text: string) =>
  section.findAll('button').find((item) => item.text().includes(text))

const mutations = (calls: IApiCall[]) =>
  calls.filter((call) => call.path === 'reminder-settings/mutate').map((call) => call.body)

describe('AccountReminders', () => {
  beforeEach(() => {
    signIn()
    stubPushBrowser()
  })

  it('offers every half hour from 06:00 to 23:30', async () => {
    const { section } = await mountSection()

    const options = section
      .findAll('select[name="reminder-time"] option')
      .map((item) => item.text())
    expect(options).toHaveLength(36)
    expect(options[0]).toBe('06:00')
    expect(options.at(-1)).toBe('23:30')
    expect((section.find('select[name="reminder-time"]').element as HTMLSelectElement).value).toBe(
      '19:00',
    )
  })

  it('turns the email on, then changes the time', async () => {
    const { section, calls } = await mountSection()

    await section.find('input[name="reminder-email"]').setValue(true)
    await flushPromises()
    await section.find('select[name="reminder-time"]').setValue('08:00')
    await flushPromises()

    expect(mutations(calls)).toEqual([
      { mutate: [{ operation: 'update', key: 3, attributes: { email_enabled: true } }] },
      { mutate: [{ operation: 'update', key: 3, attributes: { send_time: '08:00' } }] },
    ])
  })

  it('registers this device once the browser allows the notifications', async () => {
    const browser = stubPushBrowser({ permission: 'granted' })
    const { section, calls } = await mountSection()

    await button(section, 'Activer sur cet appareil')?.trigger('click')
    await flushPromises()

    expect(browser.requestPermission).toHaveBeenCalled()
    expect(calls.some((call) => call.path === 'push-subscriptions/actions/register-device')).toBe(
      true,
    )
    expect(section.text()).toContain('Chrome sur Android')
    expect(section.text()).toContain('Cet appareil')
  })

  it('records nothing and explains how to allow them when the browser refuses', async () => {
    stubPushBrowser({ permission: 'denied' })
    const { section, calls } = await mountSection()

    await button(section, 'Activer sur cet appareil')?.trigger('click')
    await flushPromises()

    expect(section.text()).toContain('Les notifications sont bloquées pour ce site.')
    expect(calls.some((call) => call.path === 'push-subscriptions/actions/register-device')).toBe(
      false,
    )
  })

  it('asks to install CINQ first on an iPhone outside the installed app', async () => {
    stubBrowserWithoutPush(IPHONE_SAFARI)
    const { section } = await mountSection()

    expect(section.text()).toContain(
      "Sur iPhone et iPad, les notifications ne fonctionnent qu'une fois CINQ installé sur l'écran d'accueil.",
    )
    expect(button(section, 'Voir comment installer')).toBeDefined()
    expect(button(section, 'Activer sur cet appareil')).toBeUndefined()
  })

  it('lists every device, recognises this one, and turns each off separately', async () => {
    stubPushBrowser({ currentEndpoint: 'https://push.example.test/2' })
    const { section, calls } = await mountSection({
      setting: { devices_count: 2 },
      devices: [
        aDevice(2, { device_label: 'Chrome sur Android' }),
        aDevice(1, { device_label: 'Firefox sur Windows' }),
      ],
    })

    const rows = section.findAll('.reminder-device-row')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.text()).toContain('Cet appareil')
    expect(rows[1]!.text()).not.toContain('Cet appareil')

    await rows[1]!.find('button').trigger('click')
    await flushPromises()

    expect(calls.find((call) => call.path === 'push-subscriptions')?.body).toEqual({
      resources: [1],
    })
    expect(section.findAll('.reminder-device-row')).toHaveLength(1)
    expect(button(section, 'Activer sur cet appareil')).toBeUndefined()
  })
})
