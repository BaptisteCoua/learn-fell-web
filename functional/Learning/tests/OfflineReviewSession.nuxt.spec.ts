import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { openOfflineStore } from '../app/offline/database'
import SessionPage from '../app/pages/revisions/seance.vue'
import {
  aCard,
  aLearning,
  aPack,
  aPackCard,
  aPackLearning,
  goOffline,
  goOnline,
  openOffline,
  seedDevice,
  signIn,
  stubLearningApi,
} from './support/learningApi'

type Page = Awaited<ReturnType<typeof mountSuspended>>

const button = (page: Page, text: RegExp) =>
  page.findAll('button').find((item) => text.test(item.text()))

// The device storage settles on later ticks: wait for what the page shows.
const shown = (page: Page, selector: string) =>
  vi.waitFor(() => expect(page.find(selector).exists()).toBe(true))

const answerCurrent = async (page: Page, known: boolean) => {
  await button(page, /Afficher la réponse/)?.trigger('click')
  await button(page, known ? /^Je savais/ : /Je ne savais pas/)?.trigger('click')
  await shown(page, '.session-card__result')
}

const pack = aPack({
  learnings: [aPackLearning({ box_1_count: 1, box_2_count: 1 })],
  cards: [
    aPackCard(1, { box: 2, next_review_on: '2026-10-05' }, [
      { alt: 'Hibou en vol', position: 1 },
      { alt: 'Hibou de face', position: 0 },
    ]),
    aPackCard(2, { box: 1, next_review_on: '2026-10-03' }),
    aPackCard(3, { box: 1, next_review_on: '2026-10-07' }),
    aPackCard(4, { subject_id: 26, next_review_on: '2026-10-01' }),
  ],
})

describe('a session offline', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-05T08:00:00Z') })
    await seedDevice(pack)
    openOffline()
  })

  afterEach(() => {
    vi.useRealTimers()
    goOnline()
  })

  it('reviews the cards of the day of the chosen subjects, the most overdue first (US1-2, FR-006)', async () => {
    const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })

    expect(page.find('.session-page__eyebrow').text()).toBe('Séance · 2 cartes')
    expect(page.text()).toContain('Recto 2')
    expect(page.text()).toContain('Hors ligne — cartes à jour du')
  })

  it('moves the card, shows where it goes and keeps the answer on the device (US1-3, FR-008)', async () => {
    const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })

    expect(page.text()).not.toContain('Verso 2')
    await answerCurrent(page, true)

    expect(page.text()).toContain('Boîte 1 → boîte 2')
    expect(page.text()).toContain('Revient : dans 2 jours')
    expect(page.text()).toContain('1 réponse à envoyer')

    const [answer] = await (await openOfflineStore()).listAnswers()
    expect(answer).toMatchObject({ card_progress_id: 2, known: true, due_on: '2026-10-03' })
  })

  it('shows the description of the images, not the images (US1-5, FR-002)', async () => {
    const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })
    await answerCurrent(page, false)
    await button(page, /Carte suivante/)?.trigger('click')
    await flushPromises()

    expect(page.findAll('.session-card__face img')).toHaveLength(0)
    expect(page.findAll('.offline-image-notice__item').map((item) => item.text())).toEqual([
      'Image non disponible hors ligneHibou de face',
      'Image non disponible hors ligneHibou en vol',
    ])
  })

  it('ends with the summary, from the boxes worked out on the device (US1-4)', async () => {
    const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })
    await answerCurrent(page, false)
    await button(page, /Carte suivante/)?.trigger('click')
    await answerCurrent(page, true)
    await button(page, /Voir le bilan/)?.trigger('click')
    await shown(page, '.session-summary')

    expect(page.findAll('.session-summary__score strong').map((score) => score.text())).toEqual([
      '1',
      '1',
    ])
    // Box 2 → 3 for the known card; the missed one stays in box 1.
    expect(page.text()).toContain('1B1 · 1j0B2 · 2j1B3')
    expect(await (await openOfflineStore()).listAnswers()).toHaveLength(2)
  })
})

describe('a session online that loses the network (edge case)', () => {
  afterEach(() => {
    goOnline()
  })

  it('goes on, and keeps the next answers on the device', async () => {
    await seedDevice(null)
    signIn()
    stubLearningApi({
      'card-progress/search': () => [aCard(1), aCard(2)],
      'card-progress/actions/answer': () => ({ data: { impacted: 1 } }),
      'learnings/search': () => [aLearning()],
    })
    const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })

    goOffline()
    await answerCurrent(page, true)

    expect(page.text()).toContain('Boîte 1 → boîte 2')
    expect(page.find('.session-card__error').exists()).toBe(false)
    expect(page.text()).toContain('1 réponse à envoyer')
  })
})
