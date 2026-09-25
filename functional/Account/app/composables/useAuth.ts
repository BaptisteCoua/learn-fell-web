export interface IRegistration {
  display_name: string
  email: string
  password: string
  password_confirmation: string
}

export interface IPasswordReset {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface IVerificationLink {
  id: string
  hash: string
  expires: string
  nonce: string
  signature: string
}

/**
 * The account endpoints of the API (Fortify and the confirmation routes). Every failure is
 * thrown as is; the forms turn it into a message with `useApiError`.
 */
export const useAuth = () => {
  const apiFetch = useApiFetch()
  const sessionStore = useSessionStore()

  // Reviews fall due at midnight in the learner's own time zone.
  const deviceTimezone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone

  const register = async (registration: IRegistration): Promise<void> => {
    await apiFetch('/register', {
      method: 'POST',
      body: { ...registration, timezone: deviceTimezone() },
    })
  }

  const login = async (email: string, password: string): Promise<void> => {
    await apiFetch('/login', {
      method: 'POST',
      body: { email, password, timezone: deviceTimezone() },
    })
    await sessionStore.fetchUser()
  }

  const logout = async (): Promise<void> => {
    await apiFetch('/logout', { method: 'POST' })
    sessionStore.clear()
  }

  const verifyEmail = async (link: IVerificationLink): Promise<void> => {
    // The signature covers the query in this order.
    await apiFetch(`/email/verify/${link.id}/${link.hash}`, {
      query: { expires: link.expires, nonce: link.nonce, signature: link.signature },
    })
    await sessionStore.fetchUser()
  }

  const resendVerification = async (email: string): Promise<void> => {
    await apiFetch('/email/verification-notification', { method: 'POST', body: { email } })
  }

  const forgotPassword = async (email: string): Promise<void> => {
    await apiFetch('/forgot-password', { method: 'POST', body: { email } })
  }

  const resetPassword = async (passwordReset: IPasswordReset): Promise<void> => {
    await apiFetch('/reset-password', { method: 'POST', body: passwordReset })
  }

  return {
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  }
}
