/**
 * The learning panel of a subject page: learn it, see its boxes, review it, stop learning.
 */
export const useLearningPanel = async (subjectId: number) => {
  const nuxtApp = useNuxtApp()
  const sessionStore = useSessionStore()
  const { t } = useI18n()
  const { notify, notifyError } = useToast()

  const learning = ref<Learning | null>(null)
  const isStopDialogOpen = ref(false)
  const isBusy = ref(false)

  const boxCounts = computed(() => (learning.value ? boxCountsOf(learning.value) : [0, 0, 0, 0, 0]))
  const dueCount = computed(() => learning.value?.due_today_count ?? 0)

  const load = async (): Promise<void> => {
    if (!sessionStore.isSignedIn) {
      return
    }

    const [found] = await nuxtApp.runWithContext(() =>
      Learning.query().where('subject_id', subjectId).limit(1).get(),
    )
    learning.value = Array.from(found)[0] ?? null
  }

  const learn = async (): Promise<void> => {
    isBusy.value = true

    try {
      await Learning.new({ subject_id: subjectId }).save()
      await load()
      notify(t('you are learning this subject: its cards are in box 1.'))
    } catch {
      notifyError(t('something went wrong, please try again'))
    } finally {
      isBusy.value = false
    }
  }

  const stop = async (): Promise<void> => {
    isStopDialogOpen.value = false

    if (!learning.value) {
      return
    }

    try {
      await learning.value.delete()
      learning.value = null
      notify(t('you no longer learn this subject. its progress is deleted.'))
    } catch {
      notifyError(t('something went wrong, please try again'))
    }
  }

  const askToStop = (): void => {
    isStopDialogOpen.value = true
  }

  const closeStopDialog = (): void => {
    isStopDialogOpen.value = false
  }

  await load()

  return {
    learning,
    boxCounts,
    dueCount,
    isStopDialogOpen,
    isBusy,
    learn,
    stop,
    askToStop,
    closeStopDialog,
  }
}
