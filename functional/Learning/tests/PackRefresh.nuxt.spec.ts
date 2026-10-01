import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LearnSubjectPanel from '../app/components/LearnSubjectPanel.vue'
import { openOfflineStore } from '../app/offline/database'
import RevisionsPage from '../app/pages/revisions/index.vue'
import SessionPage from '../app/pages/revisions/seance.vue'
import {
  aCard,
  aLearning,
  seedDevice,
  signIn,
  stubLearningApi,
  type IApiCall,
} from './support/learningApi'

type Page = Awaited<ReturnType<typeof mountSuspended>>

const button = (page: Page, text: RegExp) =>
  page.findAll('button').find((item) => text.test(item.text()))

const isUpcomingSearch = (call: IApiCall) =>
  call.path === 'card-progress/search' && JSON.stringify(call.body).includes('"name":"upcoming"')

// The device keeps what `upcoming` gave, without the image files (FR-001, FR-002).
const packUpdated = () =>
  vi.waitFor(async () => {
    const pack = await (await openOfflineStore()).readPack()
    expect(pack?.cards.map((card) => card.id)).toEqual([9])
    expect(pack?.cards[0]?.question.images).toEqual([{ alt: 'Hibou de face', position: 0 }])
  })

const api = (handlers: Record<string, (call: IApiCall) => unknown> = {}) =>
  stubLearningApi({
    'card-progress/search': (call) =>
      isUpcomingSearch(call)
        ? [
            aCard(9, 1, [
              {
                id: 1,
                question_id: 109,
                alt: 'Hibou de face',
                position: 0,
                width: 1600,
                height: 1067,
                variant_widths: [480],
              },
            ]),
          ]
        : [aCard(1)],
    'card-progress/actions/answer': () => ({ data: { impacted: 1 } }),
    'learnings/search': () => [aLearning()],
    ...handlers,
  })

describe('the cards kept on the device (FR-003)', () => {
  beforeEach(async () => {
    await seedDevice(null)
    signIn()
  })

  it('are updated at the end of a session', async () => {
    const calls = api()
    const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })

    await button(page, /Afficher la réponse/)?.trigger('click')
    await button(page, /^Je savais/)?.trigger('click')
    await vi.waitFor(() => expect(page.find('.session-card__result').exists()).toBe(true))
    await button(page, /Voir le bilan/)?.trigger('click')

    await packUpdated()
    expect(calls.find(isUpcomingSearch)?.body).toMatchObject({
      search: {
        instructions: [{ name: 'upcoming' }],
        includes: [
          { relation: 'question' },
          { relation: 'question.images' },
          { relation: 'subject' },
        ],
        limit: 100,
      },
    })
  })

  it('are updated after learning a subject', async () => {
    let isLearning = false
    api({
      'learnings/search': () => (isLearning ? [aLearning()] : []),
      'learnings/mutate': () => {
        isLearning = true
        return { created: [1], updated: [] }
      },
    })
    const panel = await mountSuspended(LearnSubjectPanel, {
      props: { subjectId: 25, questionCount: 3 },
    })

    await button(panel, /Apprendre ce sujet/)?.trigger('click')

    await packUpdated()
  })

  it('are updated after stopping to learn a subject', async () => {
    api({ learnings: () => ({ data: [] }) })
    const page = await mountSuspended(RevisionsPage, { route: '/revisions' })

    await button(page, /Arrêter d'apprendre/)?.trigger('click')
    // The dialog is teleported out of the page.
    const confirm = await vi.waitFor(() => {
      const found = [
        ...document.querySelectorAll<HTMLButtonElement>('.confirm-dialog button'),
      ].find((item) => /Arrêter d'apprendre/.test(item.textContent ?? ''))
      expect(found).toBeDefined()
      return found
    })
    confirm?.click()

    await packUpdated()
  })
})
