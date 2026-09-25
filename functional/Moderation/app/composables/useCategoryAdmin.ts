export type CategoryDialog = 'refused' | 'confirm'

/**
 * The categories page: add, rename, reorder and delete (FR-008 to FR-010). The order is the
 * catalogue's and the one offered to authors. A category holding subjects is not deleted.
 */
export const useCategoryAdmin = async () => {
  const nuxtApp = useNuxtApp()
  const { t } = useI18n()
  const { notify, notifyError } = useToast()
  const { toApiError } = useApiError()

  const categories = ref<Category[]>([])
  const newName = ref('')
  const createError = ref('')
  const renamingId = ref<number | null>(null)
  const draftName = ref('')
  const renameError = ref('')
  const dialog = ref<CategoryDialog | null>(null)
  const target = ref<Category | null>(null)

  const load = async (): Promise<void> => {
    const [data] = await nuxtApp.runWithContext(() =>
      Category.query().withCount('subjects').orderBy('position', 'asc').limit(100).get(),
    )
    categories.value = Array.from(data)
  }

  const errorMessageOf = (error: unknown): string => {
    const apiError = toApiError(error)

    return apiError.code
      ? apiError.message
      : (Object.values(mutationFieldErrors(apiError.fieldErrors))[0] ?? apiError.message)
  }

  const create = async (): Promise<void> => {
    const name = newName.value.trim()
    createError.value = ''

    if (!name) {
      createError.value = t('type a category name.')
      return
    }

    try {
      await Category.new({ name }).save()
      notify(t('category “{name}” added.', { name }))
      newName.value = ''
      await load()
    } catch (error) {
      createError.value = errorMessageOf(error)
    }
  }

  const startRename = (category: Category): void => {
    renamingId.value = category.id
    draftName.value = category.name
    renameError.value = ''
  }

  const cancelRename = (): void => {
    renamingId.value = null
  }

  const saveRename = async (category: Category): Promise<void> => {
    const name = draftName.value.trim()

    if (!name) {
      renameError.value = t('type a name.')
      return
    }

    try {
      category.name = name
      await category.save()
      renamingId.value = null
      notify(t('category renamed.'))
    } catch (error) {
      category.discardChanges()
      renameError.value = errorMessageOf(error)
    }
  }

  const move = async (index: number, step: -1 | 1): Promise<void> => {
    const reordered = [...categories.value]
    const [moved] = reordered.splice(index, 1)

    if (!moved || index + step < 0 || index + step > reordered.length) {
      return
    }

    reordered.splice(index + step, 0, moved)
    categories.value = reordered

    try {
      await Category.actions('reorder', [
        { name: 'ids', value: reordered.map((category) => category.id) },
      ])
    } catch {
      notifyError(t('something went wrong, please try again'))
      await load()
    }
  }

  // A category holding subjects, whatever their status, stays (FR-010).
  const askToDelete = (category: Category): void => {
    target.value = category
    dialog.value = (category.subjects_count ?? 0) > 0 ? 'refused' : 'confirm'
  }

  const closeDialog = (): void => {
    dialog.value = null
  }

  const confirmDelete = async (): Promise<void> => {
    const category = target.value
    dialog.value = null

    if (!category) {
      return
    }

    try {
      await category.delete()
      notify(t('category deleted.'))
      await load()
    } catch {
      notifyError(t('something went wrong, please try again'))
    }
  }

  await load()

  return {
    categories,
    newName,
    createError,
    renamingId,
    draftName,
    renameError,
    dialog,
    target,
    create,
    startRename,
    cancelRename,
    saveRename,
    move,
    askToDelete,
    closeDialog,
    confirmDelete,
  }
}
