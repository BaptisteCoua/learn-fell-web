import { revisionsOf, type IOfflineRevision } from '../offline/pack'

export type IRevision = Learning | IOfflineRevision

/**
 * "Mes révisions": every learned subject with its due cards and boxes; the subjects with
 * something due are selected, and the session reviews the selection (FR-043, FR-044).
 * Online, the answers kept on the device leave first; offline, the page reads what the device
 * kept (FR-005, FR-010).
 */
export const useRevisions = async () => {
  const nuxtApp = useNuxtApp()
  const sessionStore = useSessionStore()
  const offlineReview = useOfflineReview()
  const { t } = useI18n()
  const { notify, notifyError } = useToast()

  const learnings = ref<IRevision[]>([])
  const selectedIds = ref<number[]>([])
  const stopTarget = ref<Learning | null>(null)
  const isOffline = ref(false)

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

  const loadFromDevice = (): void => {
    const pack = offlineReview.pack.value
    isOffline.value = true
    learnings.value = pack ? revisionsOf(pack, localDay(new Date(), pack.timezone)) : []
  }

  const loadFromApi = async (): Promise<void> => {
    await offlineReview.flush({ refreshPack: false })
    const [data] = await nuxtApp.runWithContext(() =>
      Learning.query().include('subject').include('subject.category').limit(50).get(),
    )
    isOffline.value = false
    learnings.value = Array.from(data)
  }

  const load = async (): Promise<void> => {
    await offlineReview.ready()

    if (sessionStore.isUnreachable || !navigator.onLine) {
      loadFromDevice()
    } else {
      try {
        await loadFromApi()
      } catch (error) {
        if (!isNetworkError(error)) {
          throw error
        }

        loadFromDevice()
      }
    }

    selectedIds.value = dueLearnings.value.map((learning) => learning.subject_id)
  }

  const isSelected = (learning: IRevision): boolean =>
    selectedIds.value.includes(learning.subject_id)

  const toggle = (learning: IRevision): void => {
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

  // Stopping is saved by the API: offline it waits, like every other change (FR-020).
  const askToStop = (learning: IRevision): void => {
    if (learning instanceof Learning) {
      stopTarget.value = learning
    }
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
      void offlineReview.refreshPack()
    } catch {
      notifyError(t('something went wrong, please try again'))
    }
  }

  await load()

  return {
    learnings,
    isOffline,
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
