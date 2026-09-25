/**
 * The catalogue of one category, or of all of them: the category chips, then the published
 * subjects, optionally narrowed by a search. An unknown category is reported as not found.
 */
export const useCatalogPage = async (categoryId?: number) => {
  const route = useRoute()
  const searchText = readSearchText(route.query.q)

  // Both start before the first await, while the server still holds the Nuxt context.
  const [{ categories }, listing] = await Promise.all([
    useCategories(),
    useSubjectListing({
      categoryId,
      searchText: searchText.length >= SEARCH_MIN_LENGTH ? searchText : undefined,
    }),
  ])
  const category = computed(() => categories.value.find((item) => item.id === categoryId))

  if (categoryId !== undefined && category.value === undefined) {
    throw createError({ statusCode: 404, fatal: true })
  }

  const goToPage = async (page: number): Promise<void> => {
    await navigateTo({ query: { ...route.query, page } })
  }

  return { categories, category, searchText, ...listing, goToPage }
}
