/**
 * The account deletion screen (feature 004): the erasure date, the password that confirms the
 * request, then the confirmation page, reached logged out since the request closes the session.
 */
export const useAccountDeletion = async () => {
  const { getAccountDeletion, requestAccountDeletion } = useAuth()
  const { toApiError } = useApiError()

  const state = ref(await getAccountDeletion())
  const password = ref('')
  const passwordError = ref('')
  const errorMessage = ref('')
  const isSubmitting = ref(false)

  const submit = async (): Promise<void> => {
    isSubmitting.value = true
    passwordError.value = ''
    errorMessage.value = ''

    try {
      const eraseOn = await requestAccountDeletion(password.value, null)
      await navigateTo({ path: '/compte-supprime', query: { le: eraseOn } })
    } catch (error) {
      const apiError = toApiError(error)
      passwordError.value = apiError.fieldErrors.password ?? ''
      errorMessage.value = passwordError.value === '' ? apiError.message : ''
    } finally {
      isSubmitting.value = false
    }
  }

  return { state, password, passwordError, errorMessage, isSubmitting, submit }
}
