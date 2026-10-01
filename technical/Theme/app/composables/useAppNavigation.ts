export interface INavigationLink {
  label: string
  to: string
}

export type MenuTileTone = 'yellow' | 'blue' | 'white' | 'ink'

export interface IMenuLink extends INavigationLink {
  icon: string
  tone: MenuTileTone
}

/**
 * The header and mobile menu entries for the current session: visitor, member or admin.
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

  // The account stays in the mobile header, behind the avatar.
  const menuLinks = computed<IMenuLink[]>(() => [
    { label: t('review'), to: '/revisions', icon: 'mdi-cards-outline', tone: 'yellow' },
    { label: t('catalogue'), to: '/categories', icon: 'mdi-bookshelf', tone: 'blue' },
    { label: t('subjects'), to: '/mes-sujets', icon: 'mdi-folder-outline', tone: 'white' },
    { label: t('create'), to: '/sujets/nouveau', icon: 'mdi-plus', tone: 'ink' },
    ...(isModerator.value
      ? [
          {
            label: t('moderation'),
            to: '/admin/moderation',
            icon: 'mdi-shield-check-outline',
            tone: 'white' as const,
          },
        ]
      : []),
  ])

  // An anchor on the landing page (`/#methode`) is a place in a page, never the current page.
  const isActive = (link: INavigationLink): boolean =>
    !link.to.includes('#') && link.to !== '/' && route.path.startsWith(link.to)

  return {
    headerLinks,
    menuLinks,
    isActive,
    isSignedIn: computed(() => sessionStore.isSignedIn),
    initials: computed(() => sessionStore.initials),
  }
}
