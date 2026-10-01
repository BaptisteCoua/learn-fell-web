import { markRaw, reactive } from 'vue'
import { arrivalBox, localDay, nextReviewOn } from '../utils/leitner'
import { withAnswer } from './pack'
import type { IOfflinePack, IOfflineStore, IPendingAnswer } from './types'

export interface IAnswerResult {
  known: boolean
  fromBox: number
  toBox: number
  nextReviewOn: string
}

export interface IAnsweredCard {
  id: number
  box: number
  next_review_on: string
}

export interface IOfflineReviewApi {
  sendAnswer: (answer: IPendingAnswer) => Promise<void>
  fetchPack: () => Promise<Pick<IOfflinePack, 'learnings' | 'cards'>>
}

export interface IOfflineReviewOptions {
  api: IOfflineReviewApi
  openStore: () => Promise<IOfflineStore>
  currentUser: () => { id: number; timezone?: string } | null
  isOnline: () => boolean
  now?: () => Date
}

export interface IOfflineReviewState {
  pack: IOfflinePack | null
  pendingCount: number
  isPersistent: boolean
}

export interface IOfflineReview {
  state: IOfflineReviewState
  ready: () => Promise<void>
  recordAnswer: (card: IAnsweredCard, known: boolean) => Promise<IAnswerResult>
  flush: (options?: { refreshPack?: boolean }) => Promise<void>
  refreshPack: () => Promise<void>
  discard: () => Promise<void>
  syncForUser: (userId: number) => Promise<void>
}

// IndexedDB cannot copy a reactive proxy: the pack is kept raw and replaced as a whole.
const rawPack = (pack: IOfflinePack | null): IOfflinePack | null => (pack ? markRaw(pack) : null)

const deviceTimezone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone

// A malformed answer would block the queue forever: the API refused it for good.
const isRefusedForGood = (error: unknown): boolean => {
  const failure = error as { statusCode?: number; status?: number } | null

  return (failure?.statusCode ?? failure?.status) === 422
}

/**
 * Reviewing without the network: every answer is worked out on the device, kept there, then
 * sent in the order it was given; the cards due within 7 days are kept for the account
 * (research R1, R2, R10).
 */
export const createOfflineReview = (options: IOfflineReviewOptions): IOfflineReview => {
  const now = options.now ?? (() => new Date())
  const state = reactive<IOfflineReviewState>({ pack: null, pendingCount: 0, isPersistent: true })

  let storePromise: Promise<IOfflineStore> | null = null
  let sending: Promise<void> | null = null
  let refreshing: Promise<void> | null = null

  const store = (): Promise<IOfflineStore> => {
    storePromise ??= options.openStore().then(async (opened) => {
      state.isPersistent = opened.isPersistent
      state.pack = rawPack(await opened.readPack())
      state.pendingCount = (await opened.listAnswers()).length
      return opened
    })

    return storePromise
  }

  const ready = async (): Promise<void> => {
    await store()
  }

  const sendPending = (): Promise<void> => {
    sending ??= (async () => {
      try {
        const opened = await store()
        let answers = await opened.listAnswers()

        while (answers[0]) {
          const answer = answers[0]

          try {
            await options.api.sendAnswer(answer)
          } catch (error) {
            // Offline, or the session is closed: the answer waits for the next attempt.
            if (!isRefusedForGood(error)) {
              return
            }
          }

          await opened.removeAnswer(answer.answer_id)
          answers = await opened.listAnswers()
          state.pendingCount = answers.length
        }
      } finally {
        sending = null
      }
    })()

    return sending
  }

  const refreshPack = (): Promise<void> => {
    refreshing ??= (async () => {
      try {
        const user = options.currentUser()
        const opened = await store()

        // The pack would overwrite the boxes worked out for the answers not yet sent.
        if (!user || (await opened.listAnswers()).length > 0) {
          return
        }

        const content = await options.api.fetchPack()

        if ((await opened.listAnswers()).length > 0) {
          return
        }

        const pack: IOfflinePack = {
          user_id: user.id,
          timezone: user.timezone ?? deviceTimezone(),
          updated_at: now().toISOString(),
          ...content,
        }
        await opened.writePack(pack)
        state.pack = rawPack(pack)
      } catch {
        // Unreachable: the pack in place stays until the next update.
      } finally {
        refreshing = null
      }
    })()

    return refreshing
  }

  const flush = async ({ refreshPack: refresh = true } = {}): Promise<void> => {
    await sendPending()

    if (refresh && state.pendingCount === 0) {
      await refreshPack()
    }
  }

  const recordAnswer = async (card: IAnsweredCard, known: boolean): Promise<IAnswerResult> => {
    const opened = await store()
    const user = options.currentUser()
    const answeredAt = now()
    const day = localDay(answeredAt, state.pack?.timezone ?? user?.timezone ?? deviceTimezone())
    const toBox = arrivalBox(card.box, known)
    const comesBackOn = nextReviewOn(toBox, day)
    const answer: IPendingAnswer = {
      answer_id: crypto.randomUUID(),
      user_id: user?.id ?? state.pack?.user_id ?? 0,
      card_progress_id: card.id,
      known,
      answered_at: answeredAt.toISOString(),
      due_on: card.next_review_on.slice(0, 10),
    }
    const pack = state.pack ? withAnswer(state.pack, card.id, toBox, comesBackOn) : null

    await opened.recordAnswer(answer, pack)
    state.pack = rawPack(pack)
    state.pendingCount += 1

    if (options.isOnline()) {
      void sendPending()
    }

    return { known, fromBox: card.box, toBox, nextReviewOn: comesBackOn }
  }

  const discard = async (): Promise<void> => {
    const opened = await store()
    await opened.clear()
    storePromise = null
    state.pack = null
    state.pendingCount = 0
  }

  // The device keeps one account at a time: another account erases it, the same one sends.
  const syncForUser = async (userId: number): Promise<void> => {
    const opened = await store()
    const answers = await opened.listAnswers()
    const isForeign =
      (state.pack !== null && state.pack.user_id !== userId) ||
      answers.some((answer) => answer.user_id !== userId)

    if (isForeign) {
      await discard()
    }

    await flush()
  }

  return { state, ready, recordAnswer, flush, refreshPack, discard, syncForUser }
}

/**
 * Stands in where there is no device storage to reach, as during server rendering.
 */
export const createInertOfflineReview = (): IOfflineReview => ({
  state: reactive<IOfflineReviewState>({ pack: null, pendingCount: 0, isPersistent: false }),
  ready: async () => undefined,
  recordAnswer: async (card, known) => ({
    known,
    fromBox: card.box,
    toBox: arrivalBox(card.box, known),
    nextReviewOn: card.next_review_on,
  }),
  flush: async () => undefined,
  refreshPack: async () => undefined,
  discard: async () => undefined,
  syncForUser: async () => undefined,
})
