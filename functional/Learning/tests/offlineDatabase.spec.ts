import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { openOfflineStore } from '../app/offline/database'
import type { IOfflinePack, IPendingAnswer } from '../app/offline/types'

const pack: IOfflinePack = {
  user_id: 7,
  timezone: 'Europe/Paris',
  updated_at: '2026-10-05T06:00:00.000Z',
  learnings: [],
  cards: [],
}

const anAnswer = (answerId: string, answeredAt: string): IPendingAnswer => ({
  answer_id: answerId,
  user_id: 7,
  card_progress_id: 1,
  known: true,
  answered_at: answeredAt,
  due_on: '2026-10-05',
})

describe('the review data of the device', () => {
  afterEach(async () => {
    vi.restoreAllMocks()
    await (await openOfflineStore()).clear()
  })

  it('keeps the pack and the answers once closed and opened again', async () => {
    const store = await openOfflineStore()
    await store.recordAnswer(anAnswer('b', '2026-10-05T08:10:00.000Z'), pack)
    await store.recordAnswer(anAnswer('a', '2026-10-05T08:00:00.000Z'), null)

    const reopened = await openOfflineStore()

    expect(reopened.isPersistent).toBe(true)
    expect(await reopened.readPack()).toEqual(pack)
    expect((await reopened.listAnswers()).map((answer) => answer.answer_id)).toEqual(['a', 'b'])
  })

  it('removes one acknowledged answer', async () => {
    const store = await openOfflineStore()
    await store.recordAnswer(anAnswer('a', '2026-10-05T08:00:00.000Z'), null)
    await store.recordAnswer(anAnswer('b', '2026-10-05T08:10:00.000Z'), null)

    await store.removeAnswer('a')

    expect((await store.listAnswers()).map((answer) => answer.answer_id)).toEqual(['b'])
  })

  it('erases everything', async () => {
    const store = await openOfflineStore()
    await store.recordAnswer(anAnswer('a', '2026-10-05T08:00:00.000Z'), pack)

    await store.clear()
    const reopened = await openOfflineStore()

    expect(await reopened.readPack()).toBeNull()
    expect(await reopened.listAnswers()).toEqual([])
  })

  it('keeps the data in memory when the device refuses to store it', async () => {
    vi.spyOn(indexedDB, 'open').mockImplementation(() => {
      throw new DOMException('Refused', 'SecurityError')
    })

    const store = await openOfflineStore()
    await store.recordAnswer(anAnswer('a', '2026-10-05T08:00:00.000Z'), pack)

    expect(store.isPersistent).toBe(false)
    expect(await store.readPack()).toEqual(pack)
    expect(await store.listAnswers()).toHaveLength(1)
  })
})
