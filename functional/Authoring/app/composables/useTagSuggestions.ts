/**
 * Existing tags that start like what the author is typing, to reuse them rather than
 * creating near-duplicates.
 */
export const useTagSuggestions = () => {
  const suggestions = ref<string[]>([])
  let lastSearch = ''

  const search = async (text: string | null): Promise<void> => {
    const prefix = (text ?? '').trim().toLowerCase()
    lastSearch = prefix

    if (prefix.length < 2) {
      suggestions.value = []
      return
    }

    try {
      const [tags] = await Tag.query().where('name', 'like', `${prefix}%`).limit(10).get()

      if (lastSearch === prefix) {
        suggestions.value = Array.from(tags).map((tag) => tag.name)
      }
    } catch {
      suggestions.value = []
    }
  }

  return { suggestions, search }
}
