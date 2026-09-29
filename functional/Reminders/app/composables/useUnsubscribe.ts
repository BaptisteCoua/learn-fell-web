export type UnsubscribeState = 'pending' | 'done' | 'invalid' | 'failed'

const INVALID_LINK_STATUS = 403

/**
 * The link of a reminder email, opened without a session (FR-014): it turns the reminder
 * emails off through the API. Every invalid link reads the same, so the page never tells
 * whose account it is (FR-016). Outside lomkit, as the confirmation links of 001.
 */
export const useUnsubscribe = () => {
  const route = useRoute()
  const apiFetch = useApiFetch()

  const state = ref<UnsubscribeState>('pending')

  const linkParameter = (name: string): string | null => {
    const value = route.query[name]

    return typeof value === 'string' && value !== '' ? value : null
  }

  const unsubscribe = async (): Promise<void> => {
    const accountId = linkParameter('id')
    const version = linkParameter('v')
    const signature = linkParameter('signature')

    if (!accountId || !version || !signature) {
      state.value = 'invalid'
      return
    }

    state.value = 'pending'

    try {
      await apiFetch(`/reminders/unsubscribe/${encodeURIComponent(accountId)}`, {
        method: 'POST',
        query: { v: version, signature },
      })
      state.value = 'done'
    } catch (error) {
      state.value =
        (error as { statusCode?: number }).statusCode === INVALID_LINK_STATUS ? 'invalid' : 'failed'
    }
  }

  onMounted(unsubscribe)

  return { state, retry: unsubscribe }
}
