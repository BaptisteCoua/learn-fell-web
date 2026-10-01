import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SessionPage from '../app/pages/revisions/seance.vue'
import {
  aCard,
  aLearning,
  aQuestionImage,
  signIn,
  stubLearningApi,
  type IApiCall,
} from './support/learningApi'

type Page = Awaited<ReturnType<typeof mountSuspended>>

const button = (page: Page, text: RegExp) =>
  page.findAll('button').find((item) => text.test(item.text()))

// Answers are kept on the device first, which settles on later ticks.
const shown = (page: Page, selector: string) =>
  vi.waitFor(() => expect(page.find(selector).exists()).toBe(true))

const sent = (calls: IApiCall[]) =>
  vi.waitFor(() =>
    expect(calls.some((call) => call.path === 'card-progress/actions/answer')).toBe(true),
  )

const mountSession = async (firstCardImages: unknown[] = []) => {
  // After an answer the card is read again: box 2 when known, box 1 when missed.
  let lastKnown = true
  const calls = stubLearningApi({
    'card-progress/search': (call: IApiCall) => {
      const search = call.body.search as { filters?: { value: number }[] }
      const filteredId = search.filters?.[0]?.value

      return filteredId
        ? [
            {
              ...aCard(filteredId),
              box: lastKnown ? 2 : 1,
              next_review_on: lastKnown ? '2026-09-27' : '2026-09-26',
            },
          ]
        : [aCard(1, 1, firstCardImages), aCard(2)]
    },
    'card-progress/actions/answer': (call: IApiCall) => {
      lastKnown = (call.body.fields as { name: string; value: unknown }[])[1]?.value === true
      return { data: { impacted: 0 } }
    },
    'learnings/search': () => [
      aLearning({
        due_today_count: 0,
        box_1_count: 1,
        box_2_count: 1,
        next_review_on: '2026-09-26',
      }),
    ],
  })
  const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })

  return { page, calls }
}

describe('ReviewSession', () => {
  beforeEach(() => {
    signIn()
  })

  it('loads the due cards of the chosen subjects', async () => {
    const { page, calls } = await mountSession()

    expect(page.text()).toContain('1 / 2')
    expect(page.find('.session-page__eyebrow').text()).toBe('Séance · 2 cartes')
    expect(page.text()).toContain('Recto 1')
    expect(calls[0]?.body).toMatchObject({
      search: { instructions: [{ name: 'due', fields: [{ name: 'subject_ids', value: [25] }] }] },
    })
  })

  it('counts a session of one card in the singular', async () => {
    stubLearningApi({
      'card-progress/search': () => [aCard(1)],
      'learnings/search': () => [aLearning()],
    })
    const page = await mountSuspended(SessionPage, { route: '/revisions/seance?sujets=25' })

    expect(page.find('.session-page__eyebrow').text()).toBe('Séance · 1 carte')
  })

  it('offers the answers only once the verso is shown', async () => {
    const { page } = await mountSession()

    expect(button(page, /Je savais/)).toBeUndefined()
    expect(page.text()).not.toContain('Verso 1')

    await button(page, /Afficher la réponse/)?.trigger('click')

    expect(page.text()).toContain('Verso 1')
    expect(button(page, /^Je savais/)).toBeDefined()
    expect(button(page, /Je ne savais pas/)).toBeDefined()
  })

  it('counts a double click once and shows where the card went', async () => {
    const { page, calls } = await mountSession()
    await button(page, /Afficher la réponse/)?.trigger('click')

    const known = button(page, /^Je savais/)
    await known?.trigger('click')
    await known?.trigger('click')
    await shown(page, '.session-card__result')
    await sent(calls)

    expect(calls.filter((call) => call.path === 'card-progress/actions/answer')).toHaveLength(1)
    expect(page.text()).toContain('Boîte 1 → boîte 2')
  })

  it('sends each answer with its id, the time it was given and the due date it answers', async () => {
    const { page, calls } = await mountSession()

    await button(page, /Afficher la réponse/)?.trigger('click')
    await button(page, /^Je savais/)?.trigger('click')
    await sent(calls)

    const answer = calls.find((call) => call.path === 'card-progress/actions/answer')
    const fields = Object.fromEntries(
      (answer?.body.fields as { name: string; value: unknown }[]).map((field) => [
        field.name,
        field.value,
      ]),
    )
    expect(fields).toMatchObject({ card_progress_id: 1, known: true, due_on: '2026-09-25' })
    expect(fields.answer_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(Date.parse(String(fields.answered_at))).not.toBeNaN()
  })

  it('asks for the images of the questions', async () => {
    const { calls } = await mountSession()

    expect(calls[0]?.body).toMatchObject({
      search: {
        includes: [
          { relation: 'question' },
          { relation: 'question.images' },
          { relation: 'subject' },
        ],
      },
    })
  })

  it('shows the images of the recto at once, before the verso', async () => {
    const { page } = await mountSession([
      aQuestionImage(2, 1, 'Hibou en vol'),
      aQuestionImage(1, 0, 'Hibou de face'),
    ])
    const images = page.findAll('.session-card__face img')

    expect(page.text()).not.toContain('Verso 1')
    expect(images.map((image) => image.attributes('alt'))).toEqual([
      'Hibou de face',
      'Hibou en vol',
    ])
    expect(images[0]?.attributes('loading')).toBe('eager')
    expect(button(page, /Afficher la réponse/)).toBeDefined()
  })

  it('keeps the answers within reach below the images', async () => {
    const { page } = await mountSession([aQuestionImage(1, 0), aQuestionImage(2, 1)])

    await button(page, /Afficher la réponse/)?.trigger('click')

    expect(button(page, /^Je savais/)?.attributes('disabled')).toBeUndefined()
    expect(button(page, /Je ne savais pas/)?.attributes('disabled')).toBeUndefined()
  })

  it('shows the description of an image that does not load, and the session goes on', async () => {
    const { page, calls } = await mountSession([aQuestionImage(1, 0, 'Hibou de face')])

    await page.find('.session-card__face img').trigger('error')

    expect(page.find('.question-image-gallery__fallback').text()).toBe(
      'Image non chargée : Hibou de face',
    )

    await button(page, /Afficher la réponse/)?.trigger('click')
    await button(page, /^Je savais/)?.trigger('click')
    await shown(page, '.session-card__result')
    await sent(calls)

    expect(page.text()).toContain('Boîte 1 → boîte 2')
  })

  it('ends with the summary of the session', async () => {
    const { page } = await mountSession()

    await button(page, /Afficher la réponse/)?.trigger('click')
    await button(page, /^Je savais/)?.trigger('click')
    await shown(page, '.session-card__result')
    await button(page, /Carte suivante/)?.trigger('click')
    await button(page, /Afficher la réponse/)?.trigger('click')
    await button(page, /Je ne savais pas/)?.trigger('click')
    await shown(page, '.session-card__result')
    await button(page, /Voir le bilan/)?.trigger('click')
    await shown(page, '.session-summary')

    expect(page.findAll('.session-summary__score strong').map((score) => score.text())).toEqual([
      '1',
      '1',
    ])
    expect(page.text()).toContain('1 carte reviendra demain en boîte 1.')
  })
})
