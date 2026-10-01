export type PublishedSubjectsChoice = 'keep' | 'erase'

export interface IAuthoredSubjectsSummary {
  published_subjects_count: number
  learners_count: number
}

/**
 * The account deletion screen (feature 004): the erasure date, the choice an author of
 * published subjects must make, the password that confirms the request, then the confirmation
 * page, reached logged out since the request closes the session.
 */
export const useAccountDeletion = async () => {
  const { t } = useI18n()
  const apiFetch = useApiFetch()
  const { getAccountDeletion, requestAccountDeletion } = useAuth()
  const { toApiError } = useApiError()

  const [state, summary] = await Promise.all([
    getAccountDeletion(),
    apiFetch<IAuthoredSubjectsSummary>('/learning/authored-subjects-summary'),
  ])
  const choice = ref<PublishedSubjectsChoice | null>(null)
  const password = ref('')
  const choiceError = ref('')
  const passwordError = ref('')
  const errorMessage = ref('')
  const isSubmitting = ref(false)

  const hasPublishedSubjects = computed(() => summary.published_subjects_count > 0)

  const submit = async (): Promise<void> => {
    choiceError.value = ''
    passwordError.value = ''
    errorMessage.value = ''

    if (hasPublishedSubjects.value && choice.value === null) {
      choiceError.value = t('choose what becomes of your published subjects.')

      return
    }

    isSubmitting.value = true

    try {
      const eraseOn = await requestAccountDeletion(
        password.value,
        hasPublishedSubjects.value ? choice.value === 'keep' : null,
      )
      await navigateTo({ path: '/compte-supprime', query: { le: eraseOn } })
    } catch (error) {
      const apiError = toApiError(error)
      passwordError.value = apiError.fieldErrors.password ?? ''
      errorMessage.value = passwordError.value === '' ? apiError.message : ''
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    state: ref(state),
    summary,
    hasPublishedSubjects,
    choice,
    choiceError,
    password,
    passwordError,
    errorMessage,
    isSubmitting,
    submit,
  }
}
