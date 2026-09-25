/**
 * The read-only view of a subject page: questions with their answers to reveal, and what
 * a visitor is invited to do.
 */
export const useSubjectDetails = async (subjectId: number) => {
  const sessionStore = useSessionStore()
  const { subject, questions } = await useSubjectPage(subjectId)

  const questionIds = computed(() => questions.value.map((question) => question.id))
  const reveal = useQuestionReveal(questionIds)

  const publishedOn = computed(() =>
    subject.published_at
      ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
          new Date(subject.published_at),
        )
      : null,
  )

  return {
    subject,
    questions,
    publishedOn,
    isVisitor: computed(() => !sessionStore.isSignedIn),
    isAuthor: computed(() => sessionStore.user?.id === subject.author_id),
    isModerator: computed(() => sessionStore.can('subjects.moderate')),
    ...reveal,
  }
}
