export type LoginState = 'idle' | 'error' | 'locked' | 'unverified' | 'resent'

/**
 * The login form: a generic error, a locked account, an unconfirmed one (with a new link
 * on request). Once logged in, back to the page that asked for it.
 */
export const useLoginForm = () => {
  const route = useRoute()
  const { login, resendVerification } = useAuth()
  const { toApiError } = useApiError()

  const email = ref('')
  const password = ref('')
  const state = ref<LoginState>('idle')
  const errorMessage = ref('')
  const isSubmitting = ref(false)

  const redirectPath = computed(() => {
    const redirect = route.query.redirect

    // Only a path of this site, never another origin (`//evil.example`).
    return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/categories'
  })

  const submit = async (): Promise<void> => {
    isSubmitting.value = true

    try {
      await login(email.value, password.value)
      await navigateTo(redirectPath.value)
    } catch (error) {
      const apiError = toApiError(error)
      errorMessage.value = apiError.message
      state.value =
        apiError.code === 'locked'
          ? 'locked'
          : apiError.code === 'email_not_verified'
            ? 'unverified'
            : 'error'
    } finally {
      isSubmitting.value = false
    }
  }

  const resend = async (): Promise<void> => {
    await resendVerification(email.value)
    state.value = 'resent'
  }

  return { email, password, state, errorMessage, isSubmitting, submit, resend }
}
