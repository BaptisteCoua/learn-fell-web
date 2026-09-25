/**
 * "Mes révisions": every learned subject with its due cards and boxes; the subjects with
 * something due are selected, and the session reviews the selection (FR-043, FR-044).
 */
export const useRevisions = async () => {
  const nuxtApp = useNuxtApp()
  const { t } = useI18n()
  const { notify, notifyError } = useToast()

  const learnings = ref<Learning[]>([])
  const selectedIds = ref<number[]>([])
  const stopTarget = ref<Learning | null>(null)

  const dueLearnings = computed(() =>
    learnings.value.filter((learning) => learning.due_today_count > 0),
  )
  const allDueCount = computed(() =>
    dueLearnings.value.reduce((total, learning) => total + learning.due_today_count, 0),
  )
  const selectedLearnings = computed(() =>
    dueLearnings.value.filter((learning) => selectedIds.value.includes(learning.subject_id)),
  )
  const selectedDueCount = computed(() =>
    selectedLearnings.value.reduce((total, learning) => total + learning.due_today_count, 0),
  )
  const nextLearning = computed(
    () =>
      [...learnings.value]
        .filter((learning) => learning.next_review_on)
        .sort((first, second) =>
          (first.next_review_on ?? '').localeCompare(second.next_review_on ?? ''),
        )[0],
  )

  const load = async (): Promise<void> => {
    const [data] = await nuxtApp.runWithContext(() =>
      Learning.query().include('subject').include('subject.category').limit(50).get(),
    )
    learnings.value = Array.from(data)
    selectedIds.value = dueLearnings.value.map((learning) => learning.subject_id)
  }

  const isSelected = (learning: Learning): boolean =>
    selectedIds.value.includes(learning.subject_id)

  const toggle = (learning: Learning): void => {
    selectedIds.value = isSelected(learning)
      ? selectedIds.value.filter((subjectId) => subjectId !== learning.subject_id)
      : [...selectedIds.value, learning.subject_id]
  }

  const selectAll = (): void => {
    selectedIds.value = dueLearnings.value.map((learning) => learning.subject_id)
  }

  const selectNone = (): void => {
    selectedIds.value = []
  }

  const startSession = async (
    subjectIds: number[] = selectedLearnings.value.map((learning) => learning.subject_id),
  ) => {
    await navigateTo({ path: '/revisions/seance', query: { sujets: subjectIds.join(',') } })
  }

  const askToStop = (learning: Learning): void => {
    stopTarget.value = learning
  }

  const closeStopDialog = (): void => {
    stopTarget.value = null
  }

  const confirmStop = async (): Promise<void> => {
    const learning = stopTarget.value
    stopTarget.value = null

    if (!learning) {
      return
    }

    try {
      await learning.delete()
      notify(
        t('you no longer learn “{title}”. its progress is deleted.', {
          title: learning.subject.title,
        }),
      )
      await load()
    } catch {
      notifyError(t('something went wrong, please try again'))
    }
  }

  await load()

  return {
    learnings,
    allDueCount,
    selectedLearnings,
    selectedDueCount,
    nextLearning,
    stopTarget,
    isSelected,
    toggle,
    selectAll,
    selectNone,
    startSession,
    askToStop,
    closeStopDialog,
    confirmStop,
  }
}
