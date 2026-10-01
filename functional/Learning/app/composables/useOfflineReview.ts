import { createInertOfflineReview, type IOfflineReview } from '../offline/offlineReview'

let inertOfflineReview: IOfflineReview | null = null

/**
 * The review data kept on the device for the signed-in account, for the review pages and for
 * logging out: answers waiting to be sent, sending them, erasing everything (research R9).
 */
export const useOfflineReview = () => {
  const offlineReview =
    (useNuxtApp().$offlineReview as IOfflineReview | undefined) ??
    (inertOfflineReview ??= createInertOfflineReview())

  return {
    pack: computed(() => offlineReview.state.pack),
    pendingCount: computed(() => offlineReview.state.pendingCount),
    isPersistent: computed(() => offlineReview.state.isPersistent),
    ready: offlineReview.ready,
    recordAnswer: offlineReview.recordAnswer,
    flush: offlineReview.flush,
    refreshPack: offlineReview.refreshPack,
    discard: offlineReview.discard,
    syncForUser: offlineReview.syncForUser,
  }
}
