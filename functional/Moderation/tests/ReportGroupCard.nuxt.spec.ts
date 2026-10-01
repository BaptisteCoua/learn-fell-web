import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import ReportGroupCard from '../app/components/ReportGroupCard.vue'

const aGroup = (subject: Record<string, unknown>, reporter: Record<string, unknown> | null) => ({
  subject: {
    id: 30,
    title: 'Commandes SQL piégées',
    status: 'published',
    category: { id: 3, name: 'Informatique' },
    author: { id: 9, display_name: 'Théo Girard' },
    ...subject,
  },
  reports: [
    {
      id: 1,
      subject_id: 30,
      reason: 'incorrect',
      comment: 'La question 7 est fausse.',
      status: 'pending',
      created_at: '2026-09-24T10:00:00Z',
      reporter,
    },
  ],
  oldestAt: '2026-09-24T10:00:00Z',
  reasonCounts: [{ reason: 'incorrect', count: 1 }],
})

/**
 * Feature 004, FR-010 and FR-011 — deleted accounts in the moderation queue.
 */
describe('ReportGroupCard', () => {
  it('names a deleted author, a deleted reporter, and a withheld subject', async () => {
    const card = await mountSuspended(ReportGroupCard, {
      props: { group: aGroup({ status: 'withheld', author: { id: 9, display_name: null } }, null) },
    })
    await card
      .findAll('button')
      .find((button) => button.text() === 'Commentaires')
      ?.trigger('click')

    expect(card.find('.report-group__meta').text()).toBe(
      'Informatique · Auteur supprimé · Retenu (suppression de compte en cours)',
    )
    expect(card.find('.report-group__comment').text()).toContain('— Compte supprimé,')
  })

  it('names an active author and reporter', async () => {
    const card = await mountSuspended(ReportGroupCard, {
      props: { group: aGroup({}, { id: 101, display_name: 'Lecteur 1' }) },
    })
    await card
      .findAll('button')
      .find((button) => button.text() === 'Commentaires')
      ?.trigger('click')

    expect(card.find('.report-group__meta').text()).toBe('Informatique · Théo Girard')
    expect(card.find('.report-group__comment').text()).toContain('— Lecteur 1,')
  })
})
