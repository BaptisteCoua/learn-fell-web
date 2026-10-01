export interface IAccountLink {
  label: string
  to: string
}

/**
 * The account menu: the account, its pages, the administration pages its permissions open,
 * and logging out.
 */
export const useAccountMenu = () => {
  const { t } = useI18n()
  const sessionStore = useSessionStore()
  const { logout } = useAuth()
  const { notify, notifyError } = useToast()
  const offlineReview = useOfflineReview()

  const isLogoutDialogOpen = ref(false)

  const links = computed<IAccountLink[]>(() => [
    { label: t('my subjects'), to: '/mes-sujets' },
    { label: t('create a subject'), to: '/sujets/nouveau' },
    { label: t('review reminders'), to: '/compte#rappels' },
    { label: t('delete my account'), to: '/supprimer-mon-compte' },
  ])

  const adminLinks = computed<IAccountLink[]>(() => [
    ...(sessionStore.can('reports.review')
      ? [{ label: t('moderation queue'), to: '/admin/moderation' }]
      : []),
    ...(sessionStore.can('categories.manage')
      ? [{ label: t('categories'), to: '/admin/categories' }]
      : []),
    ...(sessionStore.can('moderation.history.view')
      ? [{ label: t('moderation history'), to: '/admin/historique' }]
      : []),
  ])

  // The review data of the device belongs to the account and leaves with it (006, FR-004).
  const logOutAnyway = async (): Promise<void> => {
    isLogoutDialogOpen.value = false
    await offlineReview.discard()

    try {
      await logout()
      notify(t('you are logged out. see you soon on cinq.'))
      await navigateTo('/')
    } catch {
      notifyError(t('something went wrong, please try again'))
    }
  }

  // Answers not yet sent would be lost: they leave first, or the account is warned (FR-018).
  const logOut = async (): Promise<void> => {
    await offlineReview.flush({ refreshPack: false })

    if (offlineReview.pendingCount.value > 0) {
      isLogoutDialogOpen.value = true
      return
    }

    await logOutAnyway()
  }

  const closeLogoutDialog = (): void => {
    isLogoutDialogOpen.value = false
  }

  return {
    user: computed(() => sessionStore.user),
    initials: computed(() => sessionStore.initials),
    links,
    adminLinks,
    pendingCount: offlineReview.pendingCount,
    isLogoutDialogOpen,
    logOut,
    logOutAnyway,
    closeLogoutDialog,
  }
}
