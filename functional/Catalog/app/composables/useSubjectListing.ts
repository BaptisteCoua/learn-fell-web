interface ISubjectListingOptions {
  categoryId?: number
  searchText?: string
}

/**
 * A paginated list of published subjects, newest first: one category, all of them, or the
 * results of a search. The page follows the `page` query parameter.
 */
export const useSubjectListing = async (options: ISubjectListingOptions) => {
  const route = useRoute()
  const page = computed(() => Math.max(1, Number(route.query.page) || 1))

  const buildQuery = () => {
    const query = withSubjectCard(Subject.query()).limit(SUBJECTS_PER_PAGE)

    if (options.categoryId !== undefined) {
      query.where('category_id', options.categoryId)
    }

    if (options.searchText) {
      query.instruction('search', [{ name: 'q', value: options.searchText }])
    }

    return query
  }

  const [data, pagination] = await buildQuery().getPage(page.value)
  const subjects = ref<Subject[]>(Array.from(data))
  const total = ref(pagination.total)
  const lastPage = ref(pagination.last_page)

  return { subjects, total, lastPage, page }
}
