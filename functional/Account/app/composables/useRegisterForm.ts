export type EmailConflict = 'taken' | 'pending' | null

/**
 * The registration form. Two different passwords are caught before sending; a taken
 * address says whether to log in or to ask for the confirmation link again.
 */
export const useRegisterForm = () => {
  const { t } = useI18n()
  const { register } = useAuth()
  const { toApiError } = useApiError()

  const displayName = ref('')
  const email = ref('')
  const password = ref('')
  const passwordConfirmation = ref('')
  const fieldErrors = ref<Record<string, string>>({})
  const emailConflict = ref<EmailConflict>(null)
  const errorMessage = ref('')
  const isSubmitting = ref(false)

  const submit = async (): Promise<void> => {
    fieldErrors.value = {}
    emailConflict.value = null
    errorMessage.value = ''

    if (password.value !== passwordConfirmation.value) {
      fieldErrors.value = { password_confirmation: t('the two passwords do not match.') }
      return
    }

    isSubmitting.value = true

    try {
      await register({
        display_name: displayName.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      })
      await navigateTo({ path: '/inscription/confirmation', query: { email: email.value } })
    } catch (error) {
      const apiError = toApiError(error)
      fieldErrors.value = apiError.fieldErrors

      if (apiError.code === 'email_taken') {
        emailConflict.value = 'taken'
      } else if (apiError.code === 'email_pending_verification') {
        emailConflict.value = 'pending'
      } else if (Object.keys(apiError.fieldErrors).length === 0) {
        errorMessage.value = apiError.message
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    displayName,
    email,
    password,
    passwordConfirmation,
    fieldErrors,
    emailConflict,
    errorMessage,
    isSubmitting,
    submit,
  }
}
