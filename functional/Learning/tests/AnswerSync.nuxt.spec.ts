import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { openOfflineStore } from '../app/offline/database'
import RevisionsPage from '../app/pages/revisions/index.vue'
import {
  aLearning,
  anAnswer,
  aPack,
  aPackCard,
  goOnline,
  openOffline,
  restoreNetwork,
  seedDevice,
  signIn,
  stubLearningApi,
  type IApiCall,
} from './support/learningApi'

const answerIdsOf = (calls: IApiCall[]) =>
  calls
    .filter((call) => call.path === 'card-progress/actions/answer')
    .map(
      (call) =>
        (call.body.fields as { name: string; value: unknown }[]).find(
          (field) => field.name === 'card_progress_id',
        )?.value,
    )

const pendingAnswers = async () => (await openOfflineStore()).listAnswers()

describe('the answers kept on the device', () => {
  afterEach(() => {
    goOnline()
  })

  it('leave before « Mes révisions » shows, in the order they were given (US2-2, FR-010, FR-012)', async () => {
    await seedDevice(aPack(), [
      anAnswer(2, '2026-10-05T08:05:00.000Z'),
      anAnswer(1, '2026-10-05T08:00:00.000Z'),
    ])
    signIn()
    const calls = stubLearningApi({
      'card-progress/actions/answer': () => ({ data: { impacted: 0 } }),
      'learnings/search': () => [aLearning()],
    })

    await mountSuspended(RevisionsPage, { route: '/revisions' })

    expect(answerIdsOf(calls)).toEqual([1, 2])
    const firstSearch = calls.findIndex((call) => call.path === 'learnings/search')
    const lastAnswer = calls.map((call) => call.path).lastIndexOf('card-progress/actions/answer')
    expect(lastAnswer).toBeLessThan(firstSearch)
    expect(await pendingAnswers()).toEqual([])
  })

  it('leave when the network comes back, and the counter goes (US2-1, FR-009)', async () => {
    await seedDevice(aPack(), [anAnswer(1, '2026-10-05T08:00:00.000Z')])
    signIn()
    const failing = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    Object.assign(useNuxtApp().$laravelRaom, { fetch: failing })

    const page = await mountSuspended(RevisionsPage, { route: '/revisions' })
    await vi.waitFor(() => expect(page.text()).toContain('1 réponse à envoyer'))

    const calls = stubLearningApi({
      'card-progress/actions/answer': () => ({ data: { impacted: 0 } }),
      'card-progress/search': () => [aPackCard(1, { box: 2, next_review_on: '2026-10-07' })],
      'learnings/search': () => [aLearning()],
    })
    window.dispatchEvent(new Event('online'))

    await vi.waitFor(() => expect(page.text()).not.toContain('réponse à envoyer'))
    expect(answerIdsOf(calls)).toEqual([1])
    // Once sent, the device takes its cards from the API again (FR-017).
    await vi.waitFor(async () =>
      expect((await (await openOfflineStore()).readPack())?.cards[0]?.box).toBe(2),
    )
  })

  it('leave when the network comes back to an app opened offline, once the account is known (FR-010)', async () => {
    await seedDevice(aPack(), [anAnswer(1, '2026-10-05T08:00:00.000Z')])
    openOffline()
    const page = await mountSuspended(RevisionsPage, { route: '/revisions' })
    await vi.waitFor(() => expect(page.text()).toContain('1 réponse à envoyer'))

    const calls = stubLearningApi({
      user: () => ({
        id: 7,
        display_name: 'Inès Martin',
        email: 'ines@exemple.fr',
        permissions: [],
        timezone: 'Europe/Paris',
      }),
      'card-progress/actions/answer': () => ({ data: { impacted: 0 } }),
      'card-progress/search': () => [],
      'learnings/search': () => [aLearning()],
    })
    restoreNetwork()
    window.dispatchEvent(new Event('online'))

    await vi.waitFor(() => expect(page.text()).not.toContain('réponse à envoyer'))
    const paths = calls.map((call) => call.path)
    expect(paths.indexOf('user')).toBeLessThan(paths.indexOf('card-progress/actions/answer'))
    expect(useSessionStore().isUnreachable).toBe(false)
    expect(answerIdsOf(calls)).toEqual([1])
  })

  it('shows no error for an answer the API sets aside (US3-2)', async () => {
    await seedDevice(aPack(), [anAnswer(1, '2026-10-05T08:00:00.000Z')])
    signIn()
    stubLearningApi({
      // The API answers the same for an answer applied, set aside or ignored.
      'card-progress/actions/answer': () => ({ data: { impacted: 0 } }),
      'learnings/search': () => [aLearning()],
    })

    const page = await mountSuspended(RevisionsPage, { route: '/revisions' })

    expect(page.find('[role="alert"]').exists()).toBe(false)
    expect(await pendingAnswers()).toEqual([])
  })
})
