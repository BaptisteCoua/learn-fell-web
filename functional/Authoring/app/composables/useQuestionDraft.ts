export type QuestionDraftTarget = number | 'new'

/**
 * The one question being written in the editor: new or existing, with its unsaved text kept
 * on failure so the author can retry (FR-014).
 */
export const useQuestionDraft = () => {
  const target = ref<QuestionDraftTarget | null>(null)
  const recto = ref('')
  const verso = ref('')
  const isEmpty = ref(false)
  const failed = ref(false)
  const isSaving = ref(false)

  const start = (questionTarget: QuestionDraftTarget, question?: Question): void => {
    target.value = questionTarget
    recto.value = question?.recto_html ?? ''
    verso.value = question?.verso_html ?? ''
    isEmpty.value = false
    failed.value = false
  }

  const cancel = (): void => {
    target.value = null
  }

  /**
   * @returns whether the question was saved
   */
  const save = async (subjectId: number, question?: Question): Promise<boolean> => {
    isEmpty.value = recto.value.trim() === '' || verso.value.trim() === ''

    if (isEmpty.value) {
      return false
    }

    isSaving.value = true

    try {
      const savedQuestion = question ?? Question.new({})

      if (!question) {
        savedQuestion.subject_id = subjectId
      }

      savedQuestion.recto_html = recto.value
      savedQuestion.verso_html = verso.value
      await savedQuestion.save()
      target.value = null
      failed.value = false
      return true
    } catch {
      failed.value = true
      return false
    } finally {
      isSaving.value = false
    }
  }

  return { target, recto, verso, isEmpty, failed, isSaving, start, cancel, save }
}
