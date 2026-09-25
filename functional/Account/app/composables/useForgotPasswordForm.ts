/**
 * Asks for a reset link. The answer never says whether the address has an account.
 */
export const useForgotPasswordForm = () => {
  const { forgotPassword } = useAuth()

  const email = ref('')
  const isSent = ref(false)
  const isSubmitting = ref(false)

  const submit = async (): Promise<void> => {
    isSubmitting.value = true

    try {
      await forgotPassword(email.value)
      isSent.value = true
    } finally {
      isSubmitting.value = false
    }
  }

  return { email, isSent, isSubmitting, submit }
}
