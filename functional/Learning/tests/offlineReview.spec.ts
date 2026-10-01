import { beforeEach, describe, expect, it, vi } from 'vitest'
import { memoryStore } from '../app/offline/database'
import { createOfflineReview, type IOfflineReviewApi } from '../app/offline/offlineReview'
import type {
  IOfflineCard,
  IOfflinePack,
  IOfflineStore,
  IPendingAnswer,
} from '../app/offline/types'

const aPackCard = (id: number, box: number, nextReviewOn: string): IOfflineCard => ({
  id,
  subject_id: 25,
  question_id: 100 + id,
  box,
  next_review_on: nextReviewOn,
  subject: { id: 25, title: 'Verbes irréguliers' },
  question: {
    id: 100 + id,
    recto_html: '<p>R</p>',
    verso_html: '<p>V</p>',
    position: id,
    images: [],
  },
})

const aPack = (userId = 7): IOfflinePack => ({
  user_id: userId,
  timezone: 'Europe/Paris',
  updated_at: '2026-10-05T06:00:00.000Z',
  learnings: [
    {
      id: 1,
      subject_id: 25,
      box_1_count: 0,
      box_2_count: 2,
      box_3_count: 0,
      box_4_count: 0,
      box_5_count: 0,
      next_review_on: '2026-10-05',
      subject: { id: 25, title: 'Verbes irréguliers', category: null },
    },
  ],
  cards: [aPackCard(1, 2, '2026-10-05'), aPackCard(2, 2, '2026-10-05')],
})

const networkError = () => new TypeError('Failed to fetch')
const statusError = (statusCode: number) => Object.assign(new Error('Refused'), { statusCode })

const setUp = async ({ online = true, pack = aPack() as IOfflinePack | null } = {}) => {
  const store: IOfflineStore = memoryStore()
  if (pack) {
    await store.writePack(pack)
  }

  const sent: IPendingAnswer[] = []
  const api = {
    sendAnswer: vi.fn(async (answer: IPendingAnswer) => {
      sent.push(answer)
    }),
    fetchPack: vi.fn(async () => ({ learnings: [], cards: [aPackCard(9, 1, '2026-10-06')] })),
  } satisfies IOfflineReviewApi
  const connection = { online }
  let now = new Date('2026-10-05T06:30:00Z')

  const offlineReview = createOfflineReview({
    api,
    openStore: async () => store,
    currentUser: () => ({ id: 7, timezone: 'Europe/Paris' }),
    isOnline: () => connection.online,
    now: () => now,
  })
  await offlineReview.ready()

  return {
    offlineReview,
    store,
    api,
    sent,
    connection,
    setNow: (instant: string) => {
      now = new Date(instant)
    },
  }
}

describe('answering', () => {
  it('works out the box and the date on the device, in the account time zone (SC-003)', async () => {
    const { offlineReview, setNow } = await setUp({ online: false })
    // 23:30 in UTC is already the next day in Paris.
    setNow('2026-10-05T23:30:00Z')

    const result = await offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), true)

    expect(result).toEqual({ known: true, fromBox: 2, toBox: 3, nextReviewOn: '2026-10-10' })
  })

  it('keeps the answer on the device before anything is sent (FR-008)', async () => {
    const { offlineReview, store, api } = await setUp({ online: false })

    await offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), false)
    const [answer] = await store.listAnswers()

    expect(api.sendAnswer).not.toHaveBeenCalled()
    expect(answer).toMatchObject({
      user_id: 7,
      card_progress_id: 1,
      known: false,
      answered_at: '2026-10-05T06:30:00.000Z',
      due_on: '2026-10-05',
    })
    expect(answer?.answer_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(offlineReview.state.pendingCount).toBe(1)
  })

  it('moves the card and the boxes of its subject in the pack', async () => {
    const { offlineReview, store } = await setUp({ online: false })

    await offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), true)
    const pack = await store.readPack()

    expect(pack?.cards[0]).toMatchObject({ box: 3, next_review_on: '2026-10-09' })
    expect(pack?.learnings[0]).toMatchObject({ box_2_count: 1, box_3_count: 1 })
  })

  it('sends at once when the network is there', async () => {
    const { offlineReview, sent } = await setUp()

    await offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), true)
    await offlineReview.flush({ refreshPack: false })

    expect(sent).toHaveLength(1)
    expect(offlineReview.state.pendingCount).toBe(0)
  })
})

describe('sending', () => {
  let context: Awaited<ReturnType<typeof setUp>>

  beforeEach(async () => {
    context = await setUp({ online: false })
    context.setNow('2026-10-05T06:31:00Z')
    await context.offlineReview.recordAnswer(aPackCard(2, 2, '2026-10-05'), true)
    context.setNow('2026-10-05T06:30:00Z')
    await context.offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), false)
    context.connection.online = true
  })

  it('sends in the order the answers were given, then updates the pack (FR-010, FR-012, FR-017)', async () => {
    await context.offlineReview.flush()

    expect(context.sent.map((answer) => answer.card_progress_id)).toEqual([1, 2])
    expect(context.offlineReview.state.pendingCount).toBe(0)
    expect(context.api.fetchPack).toHaveBeenCalledTimes(1)
    expect(context.offlineReview.state.pack?.cards.map((card) => card.id)).toEqual([9])
  })

  it('resumes after a cut without losing or doubling an answer (FR-016)', async () => {
    context.api.sendAnswer.mockImplementationOnce(async (answer) => {
      context.sent.push(answer)
    })
    context.api.sendAnswer.mockRejectedValueOnce(networkError())

    await context.offlineReview.flush()

    expect(context.offlineReview.state.pendingCount).toBe(1)
    expect(context.api.fetchPack).not.toHaveBeenCalled()

    await context.offlineReview.flush()

    expect(context.sent.map((answer) => answer.card_progress_id)).toEqual([1, 2])
    expect(new Set(context.sent.map((answer) => answer.answer_id)).size).toBe(2)
  })

  it('keeps the answers when the session is closed', async () => {
    context.api.sendAnswer.mockRejectedValue(statusError(401))

    await context.offlineReview.flush()

    expect(context.offlineReview.state.pendingCount).toBe(2)
  })

  it('drops an answer the API refuses for good, so it cannot block the others', async () => {
    context.api.sendAnswer.mockRejectedValueOnce(statusError(422))

    await context.offlineReview.flush()

    expect(context.offlineReview.state.pendingCount).toBe(0)
  })

  it('shares one sending between callers', async () => {
    await Promise.all([context.offlineReview.flush(), context.offlineReview.flush()])

    expect(context.api.sendAnswer).toHaveBeenCalledTimes(2)
  })
})

describe('the pack', () => {
  it('is not replaced while answers wait, so their boxes are kept (FR-017)', async () => {
    const { offlineReview, api } = await setUp({ online: false })
    await offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), true)

    await offlineReview.refreshPack()

    expect(api.fetchPack).not.toHaveBeenCalled()
  })

  it('stays as it is when the API cannot be reached', async () => {
    const { offlineReview, api } = await setUp()
    api.fetchPack.mockRejectedValue(networkError())

    await offlineReview.refreshPack()

    expect(offlineReview.state.pack?.cards).toHaveLength(2)
  })
})

describe('one account per device (FR-004)', () => {
  it('erases the data of another account before anything else', async () => {
    const { offlineReview, store, api } = await setUp({ pack: aPack(8) })
    api.fetchPack.mockRejectedValue(networkError())

    await offlineReview.syncForUser(7)

    expect(await store.readPack()).toBeNull()
    expect(offlineReview.state.pack).toBeNull()
  })

  it('sends the answers of the same account when it comes back', async () => {
    const { offlineReview, sent, connection } = await setUp({ online: false })
    await offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), true)
    connection.online = true

    await offlineReview.syncForUser(7)

    expect(sent).toHaveLength(1)
  })

  it('erases everything on discard', async () => {
    const { offlineReview, store } = await setUp({ online: false })
    await offlineReview.recordAnswer(aPackCard(1, 2, '2026-10-05'), true)

    await offlineReview.discard()

    expect(await store.listAnswers()).toEqual([])
    expect(offlineReview.state).toMatchObject({ pack: null, pendingCount: 0 })
  })
})
