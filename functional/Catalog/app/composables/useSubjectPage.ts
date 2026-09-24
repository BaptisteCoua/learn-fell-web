/**
 * A subject and all its questions in order. A subject the viewer may not see is reported as
 * not found, so its existence is never revealed (FR-023).
 */
export const useSubjectPage = async (subjectId: number) => {
  // After an await the server loses the Nuxt context: later pages run inside it again.
  const nuxtApp = useNuxtApp()
  const questionPage = (page: number) =>
    nuxtApp.runWithContext(() =>
      Question.query()
        .where('subject_id', subjectId)
        .orderBy('position', 'asc')
        .limit(100)
        .getPage(page),
    )

  const [subject, [firstQuestions, pagination]] = await Promise.all([
    withSubjectDetails(Subject.query())
      .findByKey(subjectId)
      .catch(() => {
        throw createError({ statusCode: 404, fatal: true })
      }),
    questionPage(1),
  ])

  const questions = ref<Question[]>(Array.from(firstQuestions))

  for (let page = 2; page <= pagination.last_page; page += 1) {
    const [nextQuestions] = await questionPage(page)
    questions.value = [...questions.value, ...nextQuestions]
  }

  return { subject, questions }
}
