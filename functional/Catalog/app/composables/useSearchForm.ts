/**
 * A search field that sends its text to a listing page as the `q` query parameter.
 */
export const useSearchForm = (targetPath: string, initialText = '') => {
  const text = ref(initialText)

  const submit = async (): Promise<void> => {
    const searchText = text.value.trim()

    await navigateTo({ path: targetPath, query: searchText ? { q: searchText } : {} })
  }

  return { text, submit }
}
