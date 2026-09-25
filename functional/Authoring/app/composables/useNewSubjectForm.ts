/**
 * "Nouveau sujet": the subject starts as a draft, then opens in the editor for its questions.
 */
export const useNewSubjectForm = async () => {
  const form = useSubjectForm()
  const failed = ref(false)
  const { categories } = await useCategories()

  const submit = async (): Promise<void> => {
    failed.value = false
    const subjectId = await form.save(Subject.new({}))

    if (subjectId === null) {
      failed.value = true
      return
    }

    await navigateTo(`/sujets/${subjectId}/modifier`)
  }

  return { categories, ...form, failed, submit }
}
