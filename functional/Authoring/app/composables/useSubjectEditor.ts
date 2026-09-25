export type EditorDialog = 'no-question' | 'delete-subject' | 'delete-question' | 'last-question'

/**
 * The subject editor: its fields, its questions (add, edit, move, delete) and its status.
 * A retired subject is read-only for its author (FR-033); someone else's subject is not found.
 */
export const useSubjectEditor = async (subjectId: number) => {
  const nuxtApp = useNuxtApp()
  const sessionStore = useSessionStore()
  const { t } = useI18n()
  const { notify, notifyError } = useToast()
  const { publish, unpublish, remove } = useSubjectPublication()
  // Created before the first await, while the server still holds the Nuxt context.
  const form = useSubjectForm()
  const draft = useQuestionDraft()

  const [{ subject, questions }, { categories }] = await Promise.all([
    useSubjectPage(subjectId),
    useCategories(),
  ])

  const isAuthor = subject.author_id === sessionStore.user?.id
  // A moderator edits any subject (FR-032); anyone else only their own.
  const isModerating = !isAuthor && sessionStore.can('subjects.moderate')

  if (!isAuthor && !isModerating) {
    throw createError({ statusCode: 404, fatal: true })
  }

  const status = ref<SubjectStatus>(subject.status)
  const dialog = ref<EditorDialog | null>(null)
  const questionToDelete = ref<Question | null>(null)

  form.fill({
    title: subject.title,
    categoryId: subject.category_id,
    tagNames: Array.from(subject.tags).map((tag) => tag.name),
    description: subject.description,
  })

  const isReadOnly = computed(() => status.value === 'retired' && !isModerating)

  const reloadQuestions = async (): Promise<void> => {
    const [data] = await nuxtApp.runWithContext(() =>
      Question.query().where('subject_id', subjectId).orderBy('position', 'asc').limit(100).get(),
    )
    questions.value = Array.from(data)
  }

  const saveDetails = async (): Promise<void> => {
    if ((await form.save(subject)) !== null) {
      notify(t('subject saved.'))
    }
  }

  const saveQuestion = async (question?: Question): Promise<void> => {
    if (await draft.save(subjectId, question)) {
      notify(t('question saved.'))
      await reloadQuestions()
    }
  }

  const move = async (index: number, step: -1 | 1): Promise<void> => {
    const reordered = [...questions.value]
    const [moved] = reordered.splice(index, 1)

    if (!moved || index + step < 0 || index + step > reordered.length) {
      return
    }

    reordered.splice(index + step, 0, moved)
    questions.value = reordered

    try {
      await Question.actions('reorder', [
        { name: 'subject_id', value: subjectId },
        { name: 'ids', value: reordered.map((question) => question.id) },
      ])
    } catch {
      notifyError(t('something went wrong, please try again'))
      await reloadQuestions()
    }
  }

  // A published subject keeps at least one question (FR-018).
  const askToDeleteQuestion = (question: Question): void => {
    questionToDelete.value = question
    dialog.value =
      status.value === 'published' && questions.value.length === 1
        ? 'last-question'
        : 'delete-question'
  }

  const confirmDeleteQuestion = async (): Promise<void> => {
    const question = questionToDelete.value
    dialog.value = null

    if (!question) {
      return
    }

    try {
      await question.delete()
      notify(t('question deleted.'))
      await reloadQuestions()
    } catch {
      notifyError(t('something went wrong, please try again'))
    }
  }

  const publishSubject = async (): Promise<void> => {
    if (draft.target.value !== null) {
      notifyError(t('save the question you are writing first.'))
      return
    }

    const result = await publish(subject, questions.value.length)

    if (result === 'no-question') {
      dialog.value = 'no-question'
    } else if (result === 'done') {
      status.value = 'published'
    }
  }

  const unpublishSubject = async (): Promise<void> => {
    dialog.value = null

    if ((await unpublish(subject)) === 'done') {
      status.value = 'draft'
    }
  }

  const confirmDeleteSubject = async (): Promise<void> => {
    dialog.value = null

    if ((await remove(subject)) === 'done') {
      await navigateTo('/mes-sujets')
    }
  }

  const addQuestion = (): void => {
    dialog.value = null
    draft.start('new')
  }

  const setStatus = (newStatus: SubjectStatus): void => {
    status.value = newStatus
  }

  const openDialog = (kind: EditorDialog): void => {
    dialog.value = kind
  }

  const closeDialog = (): void => {
    dialog.value = null
  }

  return {
    subject,
    questions,
    categories,
    status,
    isModerating,
    isReadOnly,
    form,
    draft,
    dialog,
    questionToDelete,
    saveDetails,
    saveQuestion,
    move,
    addQuestion,
    askToDeleteQuestion,
    confirmDeleteQuestion,
    publishSubject,
    unpublishSubject,
    confirmDeleteSubject,
    setStatus,
    openDialog,
    closeDialog,
  }
}
