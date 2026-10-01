import { dueCardsOf, revisionsOf } from '../offline/pack'
import type { IAnswerResult } from '../offline/offlineReview'
import type { IOfflineCard, IOfflineLearning } from '../offline/types'
import type { IBoxCounts } from '../utils/leitner'

export type { IAnswerResult }

export type IReviewCard = CardProgress | IOfflineCard

type ISummaryLearning = Pick<Learning, 'next_review_on'> & IBoxCounts

/**
 * A review session over the due cards of the chosen subjects (`?sujets=1,2`). The answers
 * are offered only once the verso is shown and count once each. Each answer is worked out and
 * kept on the device as it is given, then sent: leaving or losing the network keeps them
 * (FR-045 to FR-049; 006, FR-006 to FR-008). Offline, the cards come from the device.
 */
export const useReviewSession = async () => {
  const nuxtApp = useNuxtApp()
  const route = useRoute()
  const sessionStore = useSessionStore()
  const offlineReview = useOfflineReview()

  const subjectIds = String(route.query.sujets ?? '')
    .split(',')
    .map(Number)
    .filter((subjectId) => Number.isInteger(subjectId) && subjectId > 0)

  const cards = ref<IReviewCard[]>([])
  const isFromDevice = ref(false)
  const index = ref(0)
  const isRevealed = ref(false)
  const isAnswering = ref(false)
  const saveFailed = ref(false)
  const isQuitDialogOpen = ref(false)
  const isDone = ref(false)
  const results = ref<Record<number, IAnswerResult>>({})
  const summaryLearnings = ref<ISummaryLearning[]>([])

  const current = computed(() => cards.value[index.value])
  const currentResult = computed(() =>
    current.value ? results.value[current.value.id] : undefined,
  )
  const answeredCount = computed(() => Object.keys(results.value).length)
  const remainingCount = computed(() => cards.value.length - answeredCount.value)
  const isLast = computed(() => index.value >= cards.value.length - 1)
  const progressStyle = computed(() => ({
    width: `${cards.value.length === 0 ? 0 : Math.round((answeredCount.value / cards.value.length) * 100)}%`,
  }))
  const knownCount = computed(
    () => Object.values(results.value).filter((result) => result.known).length,
  )
  const missedCount = computed(() => answeredCount.value - knownCount.value)
  const summaryBoxCounts = computed(() =>
    summaryLearnings.value
      .map(boxCountsOf)
      .reduce(
        (totals, counts) => totals.map((total, box) => total + (counts[box] ?? 0)),
        [0, 0, 0, 0, 0],
      ),
  )
  const nextReviewOn = computed(
    () =>
      summaryLearnings.value
        .map((learning) => learning.next_review_on)
        .filter((date): date is string => Boolean(date))
        .sort()[0] ?? null,
  )

  const isReachable = (): boolean => !sessionStore.isUnreachable && navigator.onLine

  const reveal = (): void => {
    isRevealed.value = true
  }

  const answer = async (known: boolean): Promise<void> => {
    const card = current.value

    // Only once the verso is shown, and only once per card (double click included).
    if (!card || !isRevealed.value || isAnswering.value || currentResult.value) {
      return
    }

    isAnswering.value = true
    saveFailed.value = false

    try {
      const result = await offlineReview.recordAnswer(card, known)
      results.value = { ...results.value, [card.id]: result }
    } catch {
      saveFailed.value = true
    } finally {
      isAnswering.value = false
    }
  }

  const learningsFromDevice = (): IOfflineLearning[] => {
    const pack = offlineReview.pack.value

    return pack
      ? revisionsOf(pack, localDay(new Date(), pack.timezone)).filter((learning) =>
          subjectIds.includes(learning.subject_id),
        )
      : []
  }

  const learningsFromApi = async (): Promise<ISummaryLearning[]> => {
    await offlineReview.flush({ refreshPack: false })
    const [data] = await nuxtApp.runWithContext(() =>
      Learning.query().where('subject_id', 'in', subjectIds).limit(50).get(),
    )

    return Array.from(data)
  }

  const finish = async (): Promise<void> => {
    summaryLearnings.value = learningsFromDevice()

    if (isReachable()) {
      try {
        summaryLearnings.value = await learningsFromApi()
      } catch {
        // Unreachable: the summary keeps the boxes worked out on the device.
      }

      void offlineReview.refreshPack()
    }

    isDone.value = true
  }

  const next = async (): Promise<void> => {
    if (isLast.value) {
      await finish()
      return
    }

    index.value += 1
    isRevealed.value = false
    saveFailed.value = false
  }

  const askToQuit = (): void => {
    isQuitDialogOpen.value = true
  }

  const closeQuitDialog = (): void => {
    isQuitDialogOpen.value = false
  }

  const loadFromDevice = (): void => {
    const pack = offlineReview.pack.value
    isFromDevice.value = true
    cards.value = pack ? dueCardsOf(pack, localDay(new Date(), pack.timezone), subjectIds) : []
  }

  const loadFromApi = async (): Promise<void> => {
    const [data] = await nuxtApp.runWithContext(() =>
      CardProgress.query()
        // raom types instruction values as strings; lomkit takes the list as is.
        .instruction('due', [{ name: 'subject_ids', value: subjectIds as unknown as string }])
        .include('question')
        .include('question.images')
        .include('subject')
        .limit(100)
        .get(),
    )
    cards.value = Array.from(data)
  }

  if (subjectIds.length > 0) {
    await offlineReview.ready()

    if (isReachable()) {
      try {
        await loadFromApi()
      } catch (error) {
        if (!isNetworkError(error)) {
          throw error
        }

        loadFromDevice()
      }
    } else {
      loadFromDevice()
    }
  }

  return {
    cards,
    isFromDevice,
    current,
    currentResult,
    index,
    isRevealed,
    isAnswering,
    saveFailed,
    isQuitDialogOpen,
    isDone,
    isLast,
    answeredCount,
    remainingCount,
    progressStyle,
    knownCount,
    missedCount,
    summaryBoxCounts,
    nextReviewOn,
    reveal,
    answer,
    next,
    askToQuit,
    closeQuitDialog,
  }
}
