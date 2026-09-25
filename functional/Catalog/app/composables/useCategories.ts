/**
 * All categories in their display order, with the number of published subjects in each.
 */
export const useCategories = async () => {
  const [categories] = await Category.query()
    .withCount('subjects', 'subjects_count', [
      { field: 'status', operator: '=', value: 'published' },
    ])
    .orderBy('position', 'asc')
    .limit(100)
    .get()

  return { categories: ref<Category[]>(Array.from(categories)) }
}
