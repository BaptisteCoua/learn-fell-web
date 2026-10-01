/**
 * The registration form. Two different passwords are caught before sending. The answer never
 * says whether the address already has an account (feature 005): every valid registration leads
 * to the same « check your emails » page.
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
  const errorMessage = ref('')
  const isSubmitting = ref(false)

  const submit = async (): Promise<void> => {
    fieldErrors.value = {}
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

      if (Object.keys(apiError.fieldErrors).length === 0) {
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
    errorMessage,
    isSubmitting,
    submit,
  }
}
