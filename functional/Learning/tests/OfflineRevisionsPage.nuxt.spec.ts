import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RevisionsPage from '../app/pages/revisions/index.vue'
import {
  aLearning,
  aPack,
  aPackCard,
  aPackLearning,
  goOnline,
  openOffline,
  seedDevice,
  signIn,
  stubLearningApi,
} from './support/learningApi'

const mountPage = () => mountSuspended(RevisionsPage, { route: '/revisions' })

describe('« Mes révisions » offline', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-05T08:00:00Z') })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    goOnline()
  })

  it('shows the learned subjects, their cards of the day and their boxes (US1-1, FR-005)', async () => {
    await seedDevice(
      aPack({
        learnings: [
          aPackLearning(),
          aPackLearning({
            id: 2,
            subject_id: 26,
            subject: { id: 26, title: 'Capitales', category: null },
          }),
        ],
        cards: [
          aPackCard(1),
          aPackCard(2, { box: 2 }),
          aPackCard(3, { subject_id: 26, next_review_on: '2026-10-04' }),
          aPackCard(4, { subject_id: 26, next_review_on: '2026-10-08' }),
        ],
      }),
    )
    openOffline()

    const page = await mountPage()

    expect(page.text()).toContain('Hors ligne — cartes à jour du 5 octobre 2026')
    expect(page.text()).toContain('Verbes irréguliers')
    expect(page.text()).toContain('Capitales')
    expect(page.text()).toContain('3 cartes à réviser aujourd')
    expect(page.findAll('.revision-row__due').map((due) => due.text())).toEqual([
      '2 cartes à réviser',
      '1 carte à réviser',
    ])
    expect(page.text()).toContain('Réviser la sélection · 3 cartes')
  })

  it('counts a kept card on its own day, even offline (US1-6, FR-007)', async () => {
    await seedDevice(aPack({ cards: [aPackCard(1, { next_review_on: '2026-10-08' })] }))
    openOffline()
    vi.setSystemTime(new Date('2026-10-08T08:00:00Z'))

    const page = await mountPage()

    expect(page.find('.revision-row__due').text()).toBe('1 carte à réviser')
  })

  it('cannot stop learning offline (FR-020)', async () => {
    await seedDevice(aPack())
    openOffline()

    const page = await mountPage()

    expect(page.findAll('button').some((button) => /Arrêter d'apprendre/.test(button.text()))).toBe(
      false,
    )
  })

  it('says offline review comes after a first opening online (edge case)', async () => {
    await seedDevice(null)
    openOffline()

    const page = await mountPage()

    expect(page.text()).toContain(
      'La révision hors ligne sera possible après une première ouverture de CINQ en ligne',
    )
    expect(page.text()).not.toContain("Vous n'apprenez aucun sujet")
  })

  it('invites to reconnect once the pack is more than 7 days old (US4-5)', async () => {
    await seedDevice(aPack({ cards: [aPackCard(1, { next_review_on: '2026-10-12' })] }))
    openOffline()
    vi.setSystemTime(new Date('2026-10-13T08:00:00Z'))

    const page = await mountPage()

    expect(page.text()).toContain('Reconnectez-vous au réseau pour réviser les cartes suivantes.')
    expect(page.find('.revision-row__due').text()).toBe('1 carte à réviser')
  })

  it('says when the device cannot keep data, and works online as before (FR-019)', async () => {
    await seedDevice(null)
    vi.spyOn(indexedDB, 'open').mockImplementation(() => {
      throw new DOMException('Refused', 'SecurityError')
    })
    signIn()
    stubLearningApi({ 'learnings/search': () => [aLearning()] })

    const page = await mountPage()

    expect(page.text()).toContain("La révision hors ligne n'est pas disponible sur cet appareil")
    expect(page.text()).toContain('Verbes irréguliers')
  })
})
