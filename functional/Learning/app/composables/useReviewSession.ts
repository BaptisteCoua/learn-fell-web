export interface IAnswerResult {
  known: boolean
  fromBox: number
  toBox: number
  nextReviewOn: string
}

/**
 * A review session over the due cards of the chosen subjects (`?sujets=1,2`). The answers
 * are offered only once the verso is shown and count once each; every answer is saved as it
 * is given, so leaving keeps them (FR-045 to FR-049).
 */
export const useReviewSession = async () => {
  const nuxtApp = useNuxtApp()
  const route = useRoute()

  const subjectIds = String(route.query.sujets ?? '')
    .split(',')
    .map(Number)
    .filter((subjectId) => Number.isInteger(subjectId) && subjectId > 0)

  const cards = ref<CardProgress[]>([])
  const index = ref(0)
  const isRevealed = ref(false)
  const isAnswering = ref(false)
  const saveFailed = ref(false)
  const isQuitDialogOpen = ref(false)
  const isDone = ref(false)
  const results = ref<Record<number, IAnswerResult>>({})
  const summaryLearnings = ref<Learning[]>([])

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

  const reveal = (): void => {
    isRevealed.value = true
  }

  const answer = async (known: boolean): Promise<void> => {
    const card = current.value

    // Only once the verso is shown, and only once per card (double click included).
    if (!card || !isRevealed.value || isAnswering.value || currentResult.value) {
      return
    }

    const fromBox = card.box
    isAnswering.value = true
    saveFailed.value = false

    try {
      await CardProgress.actions('answer', [
        { name: 'card_progress_id', value: card.id },
        { name: 'known', value: known },
      ])
      const updated = await CardProgress.query().where('id', card.id).first()
      results.value = {
        ...results.value,
        [card.id]: {
          known,
          fromBox,
          toBox: updated?.box ?? fromBox,
          nextReviewOn: updated?.next_review_on ?? '',
        },
      }
    } catch {
      saveFailed.value = true
    } finally {
      isAnswering.value = false
    }
  }

  const finish = async (): Promise<void> => {
    const [data] = await Learning.query().where('subject_id', 'in', subjectIds).limit(50).get()
    summaryLearnings.value = Array.from(data)
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

  if (subjectIds.length > 0) {
    const [data] = await nuxtApp.runWithContext(() =>
      CardProgress.query()
        // raom types instruction values as strings; lomkit takes the list as is.
        .instruction('due', [{ name: 'subject_ids', value: subjectIds as unknown as string }])
        .include('question')
        .include('subject')
        .limit(100)
        .get(),
    )
    cards.value = Array.from(data)
  }

  return {
    cards,
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
