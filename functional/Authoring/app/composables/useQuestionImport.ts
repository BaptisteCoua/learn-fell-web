export const IMPORT_EXTENSIONS = ['.csv', '.tsv', '.txt', '.xlsx']
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export interface IImportMessage {
  code: string
  message: string
}

export interface IImportRowError extends IImportMessage {
  field: 'recto' | 'verso'
}

export interface IImportRowWarning extends IImportMessage {
  line?: number
  position?: number
}

export interface IImportRow {
  line: number
  recto_html: string
  verso_html: string
  errors: IImportRowError[]
  warnings: IImportRowWarning[]
}

export interface IImportPreview {
  rows: IImportRow[]
  notices: IImportMessage[]
  errors: IImportMessage[]
  question_count: number
  error_line_count: number
  can_confirm: boolean
}

export type ImportPhase = 'source' | 'preview' | 'importing'

export type ImportSourceKind = 'file' | 'text'

type ImportSource = { kind: 'file'; file: File } | { kind: 'text'; text: string }

/**
 * Importing questions into a subject (specs/008-question-import): a file or a pasted text is
 * read by the API into a preview, then sent again with the id of that preview to import it,
 * all or nothing and once (FR-014, FR-017). Only the author, or a moderator, of a subject they
 * may still edit reaches this page.
 */
export const useQuestionImport = async (subjectId: number) => {
  const nuxtApp = useNuxtApp()
  const sessionStore = useSessionStore()
  const { t } = useI18n()
  const { notify } = useToast()
  const { upload } = useUploadRequest()
  const apiFetch = useApiFetch()
  const { toApiError } = useApiError()
  const { apiBaseUrl } = useRuntimeConfig().public

  const subject = await nuxtApp
    .runWithContext(() => Subject.query().findByKey(subjectId))
    .catch(() => {
      throw createError({ statusCode: 404, fatal: true })
    })

  const isAuthor = subject.author_id === sessionStore.user?.id
  const isModerating = !isAuthor && sessionStore.can('subjects.moderate')

  if ((!isAuthor && !isModerating) || (subject.status === 'retired' && !isModerating)) {
    throw createError({ statusCode: 404, fatal: true })
  }

  // Who learns the subject gets the imported questions in box 1 (FR-019). Unknown is no warning.
  const hasLearners = ref(
    await apiFetch<{ has_learners: boolean }>(`/learning/subjects/${subjectId}/learners`)
      .then(({ has_learners }) => has_learners)
      .catch(() => false),
  )

  const phase = ref<ImportPhase>('source')
  const sourceKind = ref<ImportSourceKind>('file')
  const text = ref('')
  // Kept as it is: a reactive proxy of a File cannot be sent.
  const source = shallowRef<ImportSource | null>(null)
  const preview = ref<IImportPreview | null>(null)
  const sourceError = ref<string | null>(null)
  const importError = ref<string | null>(null)
  const isReading = ref(false)
  const importId = ref('')

  const previewPath = `/subjects/${subjectId}/question-import/preview`
  const importPath = `/subjects/${subjectId}/question-import`
  const templateUrl = `${apiBaseUrl}/question-import/template`

  // useUploadRequest already rejects with an IApiError; useApiFetch with a fetch error.
  const messageOf = (error: unknown): string =>
    error !== null && typeof error === 'object' && 'fieldErrors' in error
      ? (error as IApiError).message
      : toApiError(error).message

  const isAccepted = (candidate: File): boolean =>
    IMPORT_EXTENSIONS.some((extension) => candidate.name.toLowerCase().endsWith(extension)) &&
    candidate.size <= MAX_IMPORT_BYTES

  const showPreview = (data: IImportPreview): void => {
    preview.value = data
    importId.value = crypto.randomUUID()
    importError.value = null
    phase.value = 'preview'
  }

  /**
   * Sends the source: a file through the upload, which reports its progress, a text as JSON.
   */
  const send = async <TResponse>(
    path: string,
    sent: ImportSource,
    fields: Record<string, string> = {},
  ): Promise<TResponse> =>
    sent.kind === 'file'
      ? upload<TResponse>(path, sent.file, fields).promise
      : apiFetch<TResponse>(path, { method: 'POST', body: { text: sent.text, ...fields } })

  const read = async (candidate: ImportSource): Promise<void> => {
    source.value = candidate
    isReading.value = true

    try {
      const { data } = await send<{ data: IImportPreview }>(previewPath, candidate)
      showPreview(data)
    } catch (error) {
      sourceError.value = messageOf(error)
    } finally {
      isReading.value = false
    }
  }

  const previewFile = async (candidate: File): Promise<void> => {
    sourceError.value = null

    if (!isAccepted(candidate)) {
      sourceError.value = t('choose a csv, tsv, txt or xlsx file of 5 mb at most.')
      return
    }

    await read({ kind: 'file', file: candidate })
  }

  const previewText = async (): Promise<void> => {
    sourceError.value = null

    if (text.value.trim() !== '') {
      await read({ kind: 'text', text: text.value })
    }
  }

  const confirm = async (): Promise<void> => {
    if (!source.value || !preview.value?.can_confirm) {
      return
    }

    phase.value = 'importing'
    importError.value = null

    try {
      const { data } = await send<{ data: { imported: number } }>(importPath, source.value, {
        import_id: importId.value,
      })
      notify(t('{count} questions added.', data.imported))
      await navigateTo(`/sujets/${subjectId}/modifier`)
    } catch (error) {
      importError.value = messageOf(error)
      phase.value = 'preview'
    }
  }

  const backToSource = (): void => {
    preview.value = null
    importError.value = null
    phase.value = 'source'
  }

  return {
    subject,
    hasLearners,
    phase,
    sourceKind,
    text,
    preview,
    sourceError,
    importError,
    isReading,
    templateUrl,
    previewFile,
    previewText,
    confirm,
    backToSource,
  }
}
