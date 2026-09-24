export type SearchState = 'results' | 'empty' | 'too-short'

/**
 * The search page: published subjects of every category matching `q`. Under two characters
 * nothing is searched and the page asks for more (FR-008).
 */
export const useSearchPage = async () => {
  const route = useRoute()
  const searchText = readSearchText(route.query.q)
  const isTooShort = searchText.length < SEARCH_MIN_LENGTH

  const goToPage = async (page: number): Promise<void> => {
    await navigateTo({ query: { ...route.query, page } })
  }

  if (isTooShort) {
    const { categories } = await useCategories()

    return {
      state: computed<SearchState>(() => 'too-short'),
      searchText,
      categories,
      subjects: ref<Subject[]>([]),
      total: ref(0),
      lastPage: ref(1),
      page: computed(() => 1),
      goToPage,
    }
  }

  // Both start before the first await, while the server still holds the Nuxt context.
  const [{ categories }, listing] = await Promise.all([
    useCategories(),
    useSubjectListing({ searchText }),
  ])
  const state = computed<SearchState>(() => (listing.total.value === 0 ? 'empty' : 'results'))

  return { state, searchText, categories, ...listing, goToPage }
}
