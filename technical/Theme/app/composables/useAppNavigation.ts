export interface INavigationLink {
  label: string
  to: string
}

/**
 * The header and tab bar entries for the current session: visitor, member or admin.
 * Admin entries depend on permissions, never on a role name.
 */
export const useAppNavigation = () => {
  const { t } = useI18n()
  const route = useRoute()
  const sessionStore = useSessionStore()

  const isModerator = computed(
    () => sessionStore.can('subjects.moderate') || sessionStore.can('categories.manage'),
  )

  const headerLinks = computed<INavigationLink[]>(() => {
    if (!sessionStore.isSignedIn) {
      return [
        { label: t('catalogue'), to: '/categories' },
        { label: t('the method'), to: '/#methode' },
      ]
    }

    return [
      { label: t('catalogue'), to: '/categories' },
      { label: t('my reviews'), to: '/revisions' },
      { label: t('my subjects'), to: '/mes-sujets' },
      ...(isModerator.value ? [{ label: t('moderation'), to: '/admin/moderation' }] : []),
    ]
  })

  const tabLinks = computed<INavigationLink[]>(() => [
    { label: t('catalogue'), to: '/categories' },
    { label: t('review'), to: '/revisions' },
    { label: t('subjects'), to: '/mes-sujets' },
    { label: t('create'), to: '/sujets/nouveau' },
    { label: t('account'), to: sessionStore.isSignedIn ? '/compte' : '/connexion' },
  ])

  // An anchor on the landing page (`/#methode`) is a place in a page, never the current page.
  const isActive = (link: INavigationLink): boolean =>
    !link.to.includes('#') && link.to !== '/' && route.path.startsWith(link.to)

  return {
    headerLinks,
    tabLinks,
    isActive,
    isSignedIn: computed(() => sessionStore.isSignedIn),
    initials: computed(() => sessionStore.initials),
  }
}
