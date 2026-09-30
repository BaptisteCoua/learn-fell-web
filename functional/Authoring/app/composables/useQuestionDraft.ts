export type QuestionDraftTarget = number | 'new'

/**
 * The one question being written in the editor: new or existing, with its unsaved text kept
 * on failure so the author can retry (FR-014). The recto holds a text, images, or both
 * (FR-008); the images are saved with the question, all at once (research R6).
 */
export const useQuestionDraft = () => {
  const { toApiError } = useApiError()
  const images = useQuestionImages()

  const target = ref<QuestionDraftTarget | null>(null)
  const recto = ref('')
  const verso = ref('')
  const isEmpty = ref(false)
  const isRectoEmpty = ref(false)
  const failed = ref(false)
  const isSaving = ref(false)

  const start = (questionTarget: QuestionDraftTarget, question?: Question): void => {
    target.value = questionTarget
    recto.value = question?.recto_html ?? ''
    verso.value = question?.verso_html ?? ''
    isEmpty.value = false
    isRectoEmpty.value = false
    failed.value = false
    images.start(question)
  }

  const cancel = (): void => {
    target.value = null
    images.start()
  }

  /**
   * @returns whether the question was saved
   */
  const save = async (subjectId: number, question?: Question): Promise<boolean> => {
    const hasRecto = recto.value.trim() !== '' || images.hasImages.value
    isEmpty.value = verso.value.trim() === ''
    isRectoEmpty.value = !isEmpty.value && !hasRecto

    if (isEmpty.value || isRectoEmpty.value || images.isUploading.value) {
      return false
    }

    if (images.hasMissingAlt.value) {
      images.requireAlt()
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
      images.toRelationPayload(savedQuestion)
      await savedQuestion.save()
      target.value = null
      failed.value = false
      images.start()
      return true
    } catch (error) {
      isRectoEmpty.value = toApiError(error).code === 'recto_empty'
      failed.value = !isRectoEmpty.value
      return false
    } finally {
      isSaving.value = false
    }
  }

  return {
    target,
    recto,
    verso,
    images,
    isEmpty,
    isRectoEmpty,
    failed,
    isSaving,
    start,
    cancel,
    save,
  }
}
