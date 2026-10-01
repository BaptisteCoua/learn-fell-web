/**
 * The mobile menu sheet: closed at rest, opened from the bar at the bottom of the screen,
 * closed again as soon as a tile is chosen, even the tile of the current page.
 * The bar names the current section, or nothing on a page outside the menu.
 */
export const useAppMobileMenu = () => {
  const { menuLinks, isActive } = useAppNavigation()

  const isOpen = ref(false)

  const currentLink = computed(() => menuLinks.value.find(isActive))

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return { menuLinks, currentLink, isActive, isOpen, open, close }
}
