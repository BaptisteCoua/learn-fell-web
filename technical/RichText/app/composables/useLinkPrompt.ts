/**
 * The link field of the editor toolbar: opened on demand, applied or removed on submit.
 */
export const useLinkPrompt = (setLink: (url: string) => void) => {
  const isOpen = ref(false)
  const url = ref('')

  const open = (): void => {
    url.value = ''
    isOpen.value = true
  }

  const apply = (): void => {
    setLink(url.value)
    isOpen.value = false
  }

  return { isOpen, url, open, apply }
}
