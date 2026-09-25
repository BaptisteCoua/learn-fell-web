export type SubjectFilter = 'all' | SubjectStatus

export interface IMySubjectsDialog {
  kind: 'no-question' | 'delete'
  subject: Subject
}

/**
 * "Mes sujets": every subject of the account, whatever its status, newest change first,
 * filtered by status with the count of each (FR-020).
 */
export const useMySubjects = async () => {
  const nuxtApp = useNuxtApp()
  const sessionStore = useSessionStore()
  const { publish, unpublish, remove } = useSubjectPublication()

  const subjects = ref<Subject[]>([])
  const filter = ref<SubjectFilter>('all')
  const dialog = ref<IMySubjectsDialog | null>(null)

  const counts = computed(() => ({
    all: subjects.value.length,
    draft: subjects.value.filter((subject) => subject.status === 'draft').length,
    published: subjects.value.filter((subject) => subject.status === 'published').length,
    retired: subjects.value.filter((subject) => subject.status === 'retired').length,
  }))
  const shownSubjects = computed(() =>
    filter.value === 'all'
      ? subjects.value
      : subjects.value.filter((subject) => subject.status === filter.value),
  )

  const load = async (): Promise<void> => {
    const loaded: Subject[] = []
    let page = 1
    let hasMorePages = true

    while (hasMorePages) {
      const [data, pagination] = await nuxtApp.runWithContext(() =>
        withSubjectDetails(Subject.query())
          .where('author_id', sessionStore.user?.id ?? 0)
          .orderBy('updated_at', 'desc')
          .limit(50)
          .getPage(page),
      )
      loaded.push(...Array.from(data))
      hasMorePages = page < pagination.last_page
      page += 1
    }

    subjects.value = loaded
  }

  const publishSubject = async (subject: Subject): Promise<void> => {
    const result = await publish(subject, subject.questions_count ?? 0)

    if (result === 'no-question') {
      dialog.value = { kind: 'no-question', subject }
    } else if (result === 'done') {
      await load()
    }
  }

  const unpublishSubject = async (subject: Subject): Promise<void> => {
    if ((await unpublish(subject)) === 'done') {
      await load()
    }
  }

  const askToDelete = (subject: Subject): void => {
    dialog.value = { kind: 'delete', subject }
  }

  const confirmDelete = async (): Promise<void> => {
    const subject = dialog.value?.subject
    dialog.value = null

    if (subject && (await remove(subject)) === 'done') {
      await load()
    }
  }

  const closeDialog = (): void => {
    dialog.value = null
  }

  await load()

  return {
    subjects,
    shownSubjects,
    counts,
    filter,
    dialog,
    publishSubject,
    unpublishSubject,
    askToDelete,
    confirmDelete,
    closeDialog,
  }
}
