import { fetchPackContent } from '../offline/fetchPack'
import { openOfflineStore } from '../offline/database'
import { createOfflineReview } from '../offline/offlineReview'

/**
 * Reviewing offline for the signed-in account: its data follows the account, and the answers
 * kept on the device leave as soon as the network is back (FR-004, FR-010).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const sessionStore = useSessionStore()

  const offlineReview = createOfflineReview({
    openStore: openOfflineStore,
    currentUser: () => sessionStore.user,
    isOnline: () => navigator.onLine,
    api: {
      sendAnswer: async (answer) => {
        await nuxtApp.runWithContext(() =>
          CardProgress.actions('answer', [
            { name: 'answer_id', value: answer.answer_id },
            { name: 'card_progress_id', value: answer.card_progress_id },
            { name: 'known', value: answer.known },
            { name: 'answered_at', value: answer.answered_at },
            { name: 'due_on', value: answer.due_on },
          ]),
        )
      },
      fetchPack: () => nuxtApp.runWithContext(fetchPackContent),
    },
  })

  const syncSignedInAccount = (): void => {
    if (sessionStore.user) {
      void offlineReview.syncForUser(sessionStore.user.id)
    }
  }

  // At opening, the session is known once the first page has passed its middlewares.
  nuxtApp.hook('app:mounted', syncSignedInAccount)

  window.addEventListener('online', async () => {
    // Opened offline, the account is not known yet: it is asked for before sending.
    if (sessionStore.isUnreachable) {
      await sessionStore.fetchUser()
      syncSignedInAccount()
      return
    }

    void offlineReview.flush()
  })

  return { provide: { offlineReview } }
})
