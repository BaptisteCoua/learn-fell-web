export type DecisionFilter = 'all' | DecisionType

/**
 * The moderation history (FR-034), filtered by decision, and the retired subjects that can
 * be restored (FR-032).
 */
export const useModerationHistory = async () => {
  const nuxtApp = useNuxtApp()
  const { restore } = useModerationActions()

  const decisions = ref<ModerationDecision[]>([])
  const retiredSubjects = ref<Subject[]>([])
  const filter = ref<DecisionFilter>('all')
  const restoreTarget = ref<Subject | null>(null)

  const shownDecisions = computed(() =>
    filter.value === 'all'
      ? decisions.value
      : decisions.value.filter((decision) => decision.decision === filter.value),
  )

  const load = async (): Promise<void> => {
    const [[decisionData], [subjectData]] = await Promise.all([
      nuxtApp.runWithContext(() => ModerationDecision.query().include('admin').limit(100).get()),
      nuxtApp.runWithContext(() =>
        Subject.query()
          .where('status', 'retired')
          .include('author')
          .orderBy('updated_at', 'desc')
          .limit(50)
          .get(),
      ),
    ])
    decisions.value = Array.from(decisionData)
    retiredSubjects.value = Array.from(subjectData)
  }

  const askToRestore = (subject: Subject): void => {
    restoreTarget.value = subject
  }

  const closeRestore = (): void => {
    restoreTarget.value = null
  }

  const confirmRestore = async (): Promise<void> => {
    const subject = restoreTarget.value
    restoreTarget.value = null

    if (subject && (await restore(subject.id, subject.title)) === 'done') {
      await load()
    }
  }

  await load()

  return {
    shownDecisions,
    retiredSubjects,
    filter,
    restoreTarget,
    askToRestore,
    closeRestore,
    confirmRestore,
  }
}
