import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it } from 'vitest'
import RevisionsPage from '../app/pages/revisions/index.vue'
import { aLearning, signIn, stubLearningApi } from './support/learningApi'

const LEARNINGS = [
  aLearning({ id: 1, subject_id: 25, due_today_count: 6 }),
  aLearning({
    id: 2,
    subject_id: 26,
    due_today_count: 3,
    subject: { id: 26, title: 'Capitales', status: 'published' },
  }),
  aLearning({
    id: 3,
    subject_id: 27,
    due_today_count: 0,
    subject: { id: 27, title: 'Chimie', status: 'published' },
  }),
]

describe('RevisionsPage', () => {
  beforeEach(() => {
    signIn()
  })

  it('selects the subjects with cards due and counts them', async () => {
    stubLearningApi({ 'learnings/search': () => LEARNINGS })

    const page = await mountSuspended(RevisionsPage, { route: '/revisions' })

    expect(page.text()).toContain('9 cartes à réviser aujourd')
    expect(page.find('.revisions-page__start').text()).toBe('Réviser la sélection · 9 cartes')
    const checkboxes = page.findAll<HTMLInputElement>('input[type="checkbox"]')
    expect(checkboxes.map((checkbox) => checkbox.element.checked)).toEqual([true, true, false])
    expect(checkboxes[2]?.attributes('disabled')).toBeDefined()
  })

  it('reviews only the selection', async () => {
    stubLearningApi({ 'learnings/search': () => LEARNINGS })

    const page = await mountSuspended(RevisionsPage, { route: '/revisions' })
    await page.findAll('input[type="checkbox"]')[0]?.trigger('change')

    expect(page.find('.revisions-page__start').text()).toBe('Réviser la sélection · 3 cartes')

    await page
      .findAll('button')
      .find((button) => button.text() === 'Aucun')
      ?.trigger('click')
    expect(page.text()).toContain('Sélectionnez au moins un sujet')
  })

  it('says when nothing is due, and when nothing is learned', async () => {
    stubLearningApi({
      'learnings/search': () => [aLearning({ due_today_count: 0, next_review_on: '2999-01-01' })],
    })
    const nothingDue = await mountSuspended(RevisionsPage, { route: '/revisions' })
    expect(nothingDue.text()).toContain("Rien à réviser aujourd'hui.")

    stubLearningApi({ 'learnings/search': () => [] })
    const nothingLearned = await mountSuspended(RevisionsPage, { route: '/revisions' })
    expect(nothingLearned.text()).toContain("Vous n'apprenez aucun sujet")
  })
})
