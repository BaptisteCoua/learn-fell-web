export interface ISessionUser {
  id: number
  display_name: string
  email: string
  permissions: string[]
  timezone: string
}

/**
 * The signed-in account, shared by the header, the menus and the route middlewares.
 * `null` means a visitor, or an account the API cannot be asked about (`isUnreachable`).
 * Access decisions go through `can()`, never through role names.
 */
export const useSessionStore = defineStore('session', () => {
  const user = ref<ISessionUser | null>(null)
  const isLoaded = ref(false)
  const isUnreachable = ref(false)

  const isSignedIn = computed(() => user.value !== null)
  const initials = computed(() => initialsOf(user.value?.display_name ?? ''))

  const can = (permission: string): boolean => user.value?.permissions.includes(permission) ?? false

  const fetchUser = async (): Promise<void> => {
    const apiFetch = useApiFetch()

    try {
      user.value = await apiFetch<ISessionUser>('/user')
      isUnreachable.value = false
    } catch (error) {
      user.value = null
      isUnreachable.value = isNetworkError(error)
    } finally {
      isLoaded.value = true
    }
  }

  const clear = (): void => {
    user.value = null
  }

  return { user, isLoaded, isUnreachable, isSignedIn, initials, can, fetchUser, clear }
})
