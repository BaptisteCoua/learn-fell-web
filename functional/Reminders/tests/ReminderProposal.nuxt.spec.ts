import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import LearnSubjectPanel from '../../Learning/app/components/LearnSubjectPanel.vue'
import {
  aReminderSetting,
  signIn,
  stubPushBrowser,
  stubRemindersApi,
  type IApiCall,
} from './support/remindersApi'

const LEARNING = {
  id: 1,
  subject_id: 25,
  created_at: '2026-09-29T08:00:00Z',
  due_today_count: 3,
  box_1_count: 3,
  box_2_count: 0,
  box_3_count: 0,
  box_4_count: 0,
  box_5_count: 0,
  next_review_on: '2026-09-29',
}

const proposal = () => document.body.querySelector<HTMLElement>('.reminder-proposal')

// Vuetify keeps a closed dialog in the page while its transition runs.
const isProposalOpen = (): boolean =>
  proposal()?.closest('.v-overlay')?.classList.contains('v-overlay--active') ?? false

const proposalButton = (text: string) =>
  [...(proposal()?.querySelectorAll<HTMLButtonElement>('button') ?? [])].find((button) =>
    button.textContent?.includes(text),
  )

const tick = (name: string): void => {
  const checkbox = proposal()!.querySelector<HTMLInputElement>(`input[name="${name}"]`)!
  checkbox.checked = true
  checkbox.dispatchEvent(new Event('change'))
}

const learnTheSubject = async (setting: Record<string, unknown> = {}) => {
  let isLearning = false
  const calls = stubRemindersApi({
    'learnings/search': () => (isLearning ? [LEARNING] : []),
    'learnings/mutate': () => {
      isLearning = true
      return { data: { created: [1], updated: [] } }
    },
    'reminder-settings/search': () => [aReminderSetting(setting)],
    'reminder-settings/mutate': () => ({ data: { created: [], updated: [3] } }),
    'reminder-settings/actions/dismiss-proposal': () => ({ data: { impacted: 0 } }),
    'push-subscriptions/search': () => [],
    'push-subscriptions/actions/register-device': () => ({ data: { impacted: 0 } }),
  })
  const panel = await mountSuspended(LearnSubjectPanel, {
    props: { subjectId: 25, questionCount: 3 },
    attachTo: document.body,
  })

  await panel
    .findAll('button')
    .find((button) => button.text().includes('Apprendre ce sujet'))
    ?.trigger('click')
  await flushPromises()

  return { calls, panel }
}

const mutations = (calls: IApiCall[]) =>
  calls.filter((call) => call.path === 'reminder-settings/mutate').map((call) => call.body)

describe('ReminderProposal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    signIn()
    stubPushBrowser()
  })

  it('is offered after the first subject, both channels unticked and 19:00 chosen', async () => {
    await learnTheSubject()

    expect(isProposalOpen()).toBe(true)
    expect(proposal()?.textContent).toContain('Recevoir un rappel ?')
    expect(
      proposal()!.querySelector<HTMLInputElement>('input[name="reminder-push"]')!.checked,
    ).toBe(false)
    expect(
      proposal()!.querySelector<HTMLInputElement>('input[name="reminder-email"]')!.checked,
    ).toBe(false)
    expect(
      proposal()!.querySelector<HTMLSelectElement>('select[name="reminder-time"]')!.value,
    ).toBe('19:00')
    expect(proposalButton('Activer')?.disabled).toBe(true)
  })

  it('turns nothing on with « Plus tard », and says so to the API', async () => {
    const { calls } = await learnTheSubject()

    proposalButton('Plus tard')?.click()
    await flushPromises()

    expect(calls.some((call) => call.path === 'reminder-settings/actions/dismiss-proposal')).toBe(
      true,
    )
    expect(mutations(calls)).toEqual([])
    expect(isProposalOpen()).toBe(false)
  })

  it('turns the email on at the chosen time', async () => {
    const { calls } = await learnTheSubject()

    tick('reminder-email')
    const time = proposal()!.querySelector<HTMLSelectElement>('select[name="reminder-time"]')!
    time.value = '08:00'
    time.dispatchEvent(new Event('change'))
    await flushPromises()
    proposalButton('Activer')?.click()
    await flushPromises()

    expect(mutations(calls)).toEqual([
      {
        mutate: [
          {
            operation: 'update',
            key: 3,
            attributes: { email_enabled: true, send_time: '08:00' },
          },
        ],
      },
    ])
    expect(isProposalOpen()).toBe(false)
  })

  it('asks the browser before turning the notifications on for this device', async () => {
    const browser = stubPushBrowser({ permission: 'granted' })
    const { calls } = await learnTheSubject()

    tick('reminder-push')
    await flushPromises()
    proposalButton('Activer')?.click()
    await flushPromises()

    expect(browser.requestPermission).toHaveBeenCalled()
    expect(browser.subscribe).toHaveBeenCalled()
    const registration = calls.find(
      (call) => call.path === 'push-subscriptions/actions/register-device',
    )
    expect(registration?.body.fields).toEqual([
      { name: 'endpoint', value: 'https://push.example.test/new' },
      { name: 'public_key', value: 'p256dh-key' },
      { name: 'auth_token', value: 'auth-key' },
      { name: 'content_encoding', value: 'aes128gcm' },
      { name: 'device_label', value: 'Chrome sur Android' },
    ])
  })

  it('is not offered again once seen', async () => {
    await learnTheSubject({ proposal_seen_at: '2026-09-20T08:00:00Z' })

    expect(isProposalOpen()).toBe(false)
  })

  it('is not offered to an account that already has a channel on', async () => {
    await learnTheSubject({ email_enabled: true })

    expect(isProposalOpen()).toBe(false)
  })
})
