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
  const { notify } = useToast()

  const links = computed<IAccountLink[]>(() => [
    { label: t('my subjects'), to: '/mes-sujets' },
    { label: t('create a subject'), to: '/sujets/nouveau' },
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

  const logOut = async (): Promise<void> => {
    await logout()
    notify(t('you are logged out. see you soon on cinq.'))
    await navigateTo('/')
  }

  return {
    user: computed(() => sessionStore.user),
    initials: computed(() => sessionStore.initials),
    links,
    adminLinks,
    logOut,
  }
}
