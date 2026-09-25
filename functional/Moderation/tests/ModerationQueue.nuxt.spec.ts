import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ModerationPage from '../app/pages/admin/moderation.vue'
import { dialogText, stubApi, type IApiCall } from './support'

const SQL = {
  id: 30,
  title: 'Commandes SQL piégées',
  status: 'published',
  category: { id: 3, name: 'Informatique' },
  author: { id: 9, display_name: 'Théo Girard' },
}
const HISTORY = {
  id: 31,
  title: 'Dates clés',
  status: 'published',
  category: { id: 2, name: 'Histoire' },
  author: { id: 8, display_name: 'Léa Moreau' },
}

const aReport = (
  id: number,
  subject: typeof SQL,
  reason: string,
  createdAt: string,
  comment: string | null = null,
) => ({
  id,
  subject_id: subject.id,
  reason,
  comment,
  status: 'pending',
  created_at: createdAt,
  subject,
  reporter: { id: 100 + id, display_name: `Lecteur ${id}` },
})

const REPORTS = [
  aReport(1, HISTORY, 'incorrect', '2026-09-24T10:00:00Z'),
  aReport(2, SQL, 'inappropriate', '2026-09-23T10:00:00Z', 'La question 7 propose un DROP TABLE.'),
  aReport(3, SQL, 'inappropriate', '2026-09-24T12:00:00Z'),
  aReport(4, SQL, 'incorrect', '2026-09-25T08:00:00Z'),
]

describe('ModerationQueue', () => {
  beforeEach(() => {
    useSessionStore().user = {
      id: 1,
      display_name: 'Alex Durand',
      email: 'alex@cinq.app',
      permissions: ['reports.review', 'subjects.moderate', 'moderation.history.view'],
    }
  })

  it('groups the pending reports by subject, the oldest first', async () => {
    const calls = stubApi({ 'reports/search': () => REPORTS })

    const page = await mountSuspended(ModerationPage, { route: '/admin/moderation' })

    expect(page.findAll('.report-group__title').map((title) => title.text())).toEqual([
      'Commandes SQL piégées',
      'Dates clés',
    ])
    expect(page.findAll('.report-group__count strong').map((count) => count.text())).toEqual([
      '3',
      '1',
    ])
    expect(page.find('.report-group__reasons').text()).toContain('Contenu inapproprié2')
    expect(calls[0]?.body).toMatchObject({
      search: { filters: [{ field: 'status', operator: '=', value: 'pending' }] },
    })
  })

  it('shows the comments on demand', async () => {
    stubApi({ 'reports/search': () => REPORTS })

    const page = await mountSuspended(ModerationPage, { route: '/admin/moderation' })
    await page
      .findAll('button')
      .find((button) => button.text() === 'Commentaires')
      ?.trigger('click')

    expect(page.text()).toContain(
      '« La question 7 propose un DROP TABLE. » — Lecteur 2, contenu inapproprié',
    )
  })

  it('ignores the reports of a subject', async () => {
    const calls = stubApi({
      'reports/search': () => REPORTS,
      'moderation-decisions/mutate': () => ({ created: [1], updated: [] }),
    })

    const page = await mountSuspended(ModerationPage, { route: '/admin/moderation' })
    await page
      .findAll('button')
      .find((button) => button.text() === 'Ignorer les signalements')
      ?.trigger('click')
    await flushPromises()

    expect(
      calls.find((call: IApiCall) => call.path === 'moderation-decisions/mutate')?.body,
    ).toEqual({
      mutate: [
        { operation: 'create', attributes: { subject_id: 30, decision: 'ignored', reason: null } },
      ],
    })
  })

  it('asks for a reason before retiring a subject', async () => {
    const calls = stubApi({ 'reports/search': () => REPORTS })

    const page = await mountSuspended(ModerationPage, { route: '/admin/moderation' })
    await page
      .findAll('button')
      .find((button) => button.text() === 'Retirer le sujet')
      ?.trigger('click')
    await flushPromises()
    ;[...document.body.querySelectorAll<HTMLButtonElement>('.retire-subject button')]
      .find((button) => button.textContent?.includes('Retirer le sujet'))
      ?.click()
    await flushPromises()

    expect(dialogText()).toContain('ses 3 signalements seront clos')
    expect(dialogText()).toContain("Saisissez un motif : il sera visible par l'auteur.")
    expect(calls.some((call) => call.path === 'moderation-decisions/mutate')).toBe(false)
  })

  it('says when the queue is empty', async () => {
    stubApi({ 'reports/search': () => [] })

    const page = await mountSuspended(ModerationPage, { route: '/admin/moderation' })

    expect(page.text()).toContain('File vide')
  })
})
