export interface ISubjectFields {
  title: string
  categoryId: number | null
  tagNames: string[]
  description: string
}

/**
 * The fields of a subject, shared by "Nouveau sujet" and the editor: saving them creates or
 * updates the subject, then sets its tags by name.
 */
export const EMPTY_SUBJECT_FIELDS: ISubjectFields = {
  title: '',
  categoryId: null,
  tagNames: [],
  description: '',
}

export const useSubjectForm = (initial: ISubjectFields = EMPTY_SUBJECT_FIELDS) => {
  const { toApiError } = useApiError()

  const title = ref(initial.title)
  const categoryId = ref<number | null>(initial.categoryId)
  const tagNames = ref<string[]>([...initial.tagNames])
  const description = ref(initial.description)
  const fieldErrors = ref<Record<string, string>>({})
  const isSaving = ref(false)

  const errorCount = computed(() => Object.keys(fieldErrors.value).length)

  const fill = (fields: ISubjectFields): void => {
    title.value = fields.title
    categoryId.value = fields.categoryId
    tagNames.value = [...fields.tagNames]
    description.value = fields.description
  }

  /**
   * @returns the subject id once saved, null when the API refused it
   */
  const save = async (subject: Subject): Promise<number | null> => {
    fieldErrors.value = {}
    isSaving.value = true

    try {
      subject.title = title.value
      subject.category_id = categoryId.value as number
      subject.description = description.value

      const isNew = !subject.hasKey()
      const response = await subject.save()
      const subjectId = Number(isNew ? (response as { created: number[] }).created[0] : subject.id)

      await Subject.actions('sync-tags', [{ name: 'names', value: tagNames.value }], (query) =>
        query.where('id', subjectId),
      )

      return subjectId
    } catch (error) {
      fieldErrors.value = mutationFieldErrors(toApiError(error).fieldErrors)
      return null
    } finally {
      isSaving.value = false
    }
  }

  return { title, categoryId, tagNames, description, fieldErrors, errorCount, isSaving, fill, save }
}
