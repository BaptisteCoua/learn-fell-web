export type ConfirmationState = 'verifying' | 'sent' | 'resent' | 'confirmed' | 'expired'

const LINK_PARAMETERS = ['id', 'hash', 'expires', 'nonce', 'signature'] as const

/**
 * Step 2 of registration. Reached after signing up (`?email=`), it asks to check the inbox;
 * opened from the email link, it confirms the address, which logs the account in.
 */
export const useEmailConfirmation = () => {
  const route = useRoute()
  const sessionStore = useSessionStore()
  const { verifyEmail, resendVerification } = useAuth()

  const readQuery = (name: string): string =>
    typeof route.query[name] === 'string' ? route.query[name] : ''

  const link = LINK_PARAMETERS.every((name) => readQuery(name) !== '')
    ? {
        id: readQuery('id'),
        hash: readQuery('hash'),
        expires: readQuery('expires'),
        nonce: readQuery('nonce'),
        signature: readQuery('signature'),
      }
    : null

  const state = ref<ConfirmationState>(link ? 'verifying' : 'sent')
  const email = ref(readQuery('email'))
  const isSending = ref(false)

  const displayName = computed(() => sessionStore.user?.display_name ?? '')

  const resend = async (): Promise<void> => {
    isSending.value = true

    try {
      await resendVerification(email.value)
      state.value = 'resent'
    } finally {
      isSending.value = false
    }
  }

  // The session cookie must land in the browser: the link is opened client-side only.
  onMounted(async () => {
    if (!link) {
      return
    }

    try {
      await verifyEmail(link)
      state.value = 'confirmed'
    } catch {
      state.value = 'expired'
    }
  })

  return { state, email, displayName, isSending, resend }
}
