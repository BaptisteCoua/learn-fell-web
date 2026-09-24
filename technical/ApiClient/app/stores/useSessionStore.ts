export interface ISessionUser {
  id: number
  display_name: string
  email: string
  permissions: string[]
}

/**
 * The signed-in account, shared by the header, the menus and the route middlewares.
 * `null` means a visitor. Access decisions go through `can()`, never through role names.
 */
export const useSessionStore = defineStore('session', () => {
  const user = ref<ISessionUser | null>(null)
  const isLoaded = ref(false)

  const isSignedIn = computed(() => user.value !== null)
  const initials = computed(() =>
    (user.value?.display_name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join(''),
  )

  const can = (permission: string): boolean => user.value?.permissions.includes(permission) ?? false

  const fetchUser = async (): Promise<void> => {
    const apiFetch = useApiFetch()

    try {
      user.value = await apiFetch<ISessionUser>('/user')
    } catch {
      user.value = null
    } finally {
      isLoaded.value = true
    }
  }

  const clear = (): void => {
    user.value = null
  }

  return { user, isLoaded, isSignedIn, initials, can, fetchUser, clear }
})
