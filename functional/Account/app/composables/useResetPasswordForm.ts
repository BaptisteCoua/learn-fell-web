export type ResetState = 'form' | 'success' | 'expired'

/**
 * Sets a new password from the emailed link (`?token=&email=`), typed twice.
 */
export const useResetPasswordForm = () => {
  const route = useRoute()
  const { t } = useI18n()
  const { resetPassword } = useAuth()
  const { toApiError } = useApiError()

  const password = ref('')
  const passwordConfirmation = ref('')
  const fieldErrors = ref<Record<string, string>>({})
  const state = ref<ResetState>('form')
  const isSubmitting = ref(false)

  const submit = async (): Promise<void> => {
    fieldErrors.value = {}

    if (password.value !== passwordConfirmation.value) {
      fieldErrors.value = { password_confirmation: t('the two passwords do not match.') }
      return
    }

    isSubmitting.value = true

    try {
      await resetPassword({
        token: String(route.query.token ?? ''),
        email: String(route.query.email ?? ''),
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      })
      state.value = 'success'
    } catch (error) {
      const apiError = toApiError(error)

      if (
        apiError.code === 'link_expired' ||
        apiError.fieldErrors.token ||
        apiError.fieldErrors.email
      ) {
        state.value = 'expired'
      } else {
        fieldErrors.value = apiError.fieldErrors
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return { password, passwordConfirmation, fieldErrors, state, isSubmitting, submit }
}
