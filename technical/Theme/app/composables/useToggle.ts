/**
 * A show/hide state for a disclosure (comments, details).
 */
export const useToggle = (initial = false) => {
  const isOpen = ref(initial)

  const toggle = (): void => {
    isOpen.value = !isOpen.value
  }

  return { isOpen, toggle }
}
