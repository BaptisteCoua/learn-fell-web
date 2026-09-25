import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import SessionPage from '../app/pages/revisions/seance.vue'
import { aCard, aLearning, signIn, stubLearningApi, type IApiCall } from './support/learningApi'

type Page = Awaited<ReturnType<typeof mountSuspended>>

const button = (page: Page, text: RegExp) =>
  page.findAll('button').find((item) => text.test(item.text()))

const mountSession = async () => {
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
        : [aCard(1), aCard(2)]
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
    expect(page.text()).toContain('Recto 1')
    expect(calls[0]?.body).toMatchObject({
      search: { instructions: [{ name: 'due', fields: [{ name: 'subject_ids', value: [25] }] }] },
    })
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
    await flushPromises()

    expect(calls.filter((call) => call.path === 'card-progress/actions/answer')).toHaveLength(1)
    expect(page.text()).toContain('Boîte 1 → boîte 2')
  })

  it('ends with the summary of the session', async () => {
    const { page } = await mountSession()

    await button(page, /Afficher la réponse/)?.trigger('click')
    await button(page, /^Je savais/)?.trigger('click')
    await flushPromises()
    await button(page, /Carte suivante/)?.trigger('click')
    await button(page, /Afficher la réponse/)?.trigger('click')
    await button(page, /Je ne savais pas/)?.trigger('click')
    await flushPromises()
    await button(page, /Voir le bilan/)?.trigger('click')
    await flushPromises()

    expect(page.find('.session-summary').exists()).toBe(true)
    expect(page.findAll('.session-summary__score strong').map((score) => score.text())).toEqual([
      '1',
      '1',
    ])
    expect(page.text()).toContain('1 carte reviendra demain en boîte 1.')
  })
})
