import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'vue3-toastify'
import QuestionImportPage from '../app/pages/sujets/[id]/importer.vue'
import { aSubject, CATEGORY, signInAsAuthor, stubAuthoringApi } from './support/authoringApi'
import { aFile, fakeUploadRequest, fakeUploads, resetFakeUploads } from './support/uploadDouble'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

// The doubles are read when called: these mocks are hoisted above the imports.
mockNuxtImport('useUploadRequest', () => () => fakeUploadRequest())
mockNuxtImport('navigateTo', () => navigateToMock)

const aRow = (line: number, overrides: Record<string, unknown> = {}) => ({
  line,
  recto_html: `<p>Capitale n°${line} ?</p>`,
  verso_html: `<p><strong>Ville ${line}</strong></p>`,
  errors: [],
  warnings: [],
  ...overrides,
})

const aPreview = (overrides: Record<string, unknown> = {}) => ({
  rows: [aRow(2), aRow(3)],
  notices: [
    {
      code: 'header_ignored',
      message: 'La première ligne est un en-tête : elle n’est pas importée.',
    },
  ],
  errors: [],
  question_count: 2,
  error_line_count: 0,
  can_confirm: true,
  ...overrides,
})

type Page = Awaited<ReturnType<typeof mountSuspended>>

const mountImport = async (handlers: Record<string, () => unknown> = {}) => {
  const calls = stubAuthoringApi({
    'subjects/search': () => [aSubject()],
    'categories/search': () => [CATEGORY],
    'learning/subjects/40/learners': () => ({ has_learners: false }),
    ...handlers,
  })
  const page = await mountSuspended(QuestionImportPage, { route: '/sujets/40/importer' })

  return { page, calls }
}

const buttonNamed = (page: Page, label: string) =>
  page.findAll('button').find((button) => button.text() === label)

const chooseFile = async (page: Page, file: File) => {
  const input = page.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

const showPreviewOf = async (page: Page, preview = aPreview()) => {
  await chooseFile(page, aFile('questions.xlsx', ''))
  fakeUploads[0]?.succeed(preview)
  await flushPromises()
}

describe('QuestionImportPage', () => {
  beforeEach(() => {
    signInAsAuthor()
    resetFakeUploads()
    navigateToMock.mockReset()
    vi.spyOn(toast, 'success').mockReturnValue(0)
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'onLine')
  })

  it('offers a file and the template to start from', async () => {
    const { page } = await mountImport()

    expect(page.text()).toContain('Fichier')
    expect(page.find('input[type="file"]').attributes('accept')).toBe('.csv,.tsv,.txt,.xlsx')
    expect(page.find('a[download]').attributes('href')).toBe(
      'http://localhost:8090/api/question-import/template',
    )
  })

  it.each([
    ['a pdf', aFile('questions.pdf', 'application/pdf', 1024)],
    ['a file over 5 mb', aFile('questions.csv', 'text/csv', 5 * 1024 * 1024 + 1)],
  ])('refuses %s before sending it', async (_kind, file) => {
    const { page } = await mountImport()

    await chooseFile(page, file)

    expect(page.find('[role="alert"]').text()).toBe(
      'Choisissez un fichier CSV, TSV, TXT ou XLSX de 5 Mo au plus.',
    )
    expect(fakeUploads).toHaveLength(0)
  })

  it('shows the questions read from the file, rendered', async () => {
    const { page } = await mountImport()

    await chooseFile(page, aFile('questions.xlsx', ''))

    expect(fakeUploads[0]?.path).toBe('/subjects/40/question-import/preview')
    fakeUploads[0]?.succeed(aPreview())
    await flushPromises()

    expect(page.text()).toContain('2 questions à importer')
    expect(page.text()).toContain('La première ligne est un en-tête : elle n’est pas importée.')
    expect(page.findAll('.question-import-row')).toHaveLength(2)
    expect(page.find('.question-import-row').text()).toContain('Ligne 2')
    expect(page.find('.question-import-row strong').text()).toBe('Ville 2')
  })

  it('imports the same file with the id of this preview, then goes back to the editor', async () => {
    const { page } = await mountImport()
    await showPreviewOf(page)

    await buttonNamed(page, 'Importer 2 questions')?.trigger('click')
    await flushPromises()

    const confirmation = fakeUploads[1]
    expect(confirmation?.path).toBe('/subjects/40/question-import')
    expect(confirmation?.file).toBe(fakeUploads[0]?.file)
    expect(confirmation?.fields.import_id).toMatch(/^[0-9a-f-]{36}$/)

    confirmation?.succeed({ imported: 2 })
    await flushPromises()

    expect(toast.success).toHaveBeenCalledWith('2 questions ajoutées.')
    expect(navigateToMock).toHaveBeenCalledWith('/sujets/40/modifier')
  })

  it('goes back to the source without importing anything', async () => {
    const { page } = await mountImport()
    await showPreviewOf(page)

    await buttonNamed(page, 'Changer de source')?.trigger('click')
    await flushPromises()

    expect(page.find('input[type="file"]').exists()).toBe(true)
    expect(fakeUploads).toHaveLength(1)
  })

  it('points to each line to fix and blocks the import', async () => {
    const { page } = await mountImport()
    await showPreviewOf(
      page,
      aPreview({
        rows: [
          aRow(2),
          aRow(12, {
            verso_html: '',
            errors: [{ field: 'verso', code: 'verso_empty', message: 'Le verso est vide.' }],
          }),
          aRow(13, {
            warnings: [
              {
                code: 'duplicate_in_subject',
                position: 4,
                message: 'Ce recto existe déjà dans le sujet (question 4).',
              },
            ],
          }),
        ],
        question_count: 3,
        error_line_count: 1,
        can_confirm: false,
      }),
    )

    expect(page.find('.question-import-preview__summary').text()).toContain('1 ligne à corriger')
    expect(page.find('a[href="#ligne-12"]').text()).toBe('Ligne 12')
    expect(page.find('#ligne-12 [role="alert"]').text()).toBe('Le verso est vide.')
    expect(page.find('#ligne-13').text()).toContain(
      'Ce recto existe déjà dans le sujet (question 4).',
    )
    expect(page.find('#ligne-13 [role="alert"]').exists()).toBe(false)
    expect(buttonNamed(page, 'Importer 3 questions')?.attributes('disabled')).toBeDefined()
  })

  it('shows what blocks the whole source above the lines', async () => {
    const { page } = await mountImport()
    await showPreviewOf(
      page,
      aPreview({
        errors: [
          {
            code: 'question_limit_exceeded',
            remaining: 1,
            message: 'Ce sujet ne peut plus recevoir que 1 questions, sur les 500 autorisées.',
          },
        ],
        can_confirm: false,
      }),
    )

    expect(page.find('.question-import-preview__summary [role="alert"]').text()).toBe(
      'Ce sujet ne peut plus recevoir que 1 questions, sur les 500 autorisées.',
    )
    expect(buttonNamed(page, 'Importer 2 questions')?.attributes('disabled')).toBeDefined()
  })

  it('keeps the preview and says why when the import is refused', async () => {
    const { page } = await mountImport()
    await showPreviewOf(page)

    await buttonNamed(page, 'Importer 2 questions')?.trigger('click')
    await flushPromises()
    fakeUploads[1]?.fail({
      status: 422,
      code: 'import_has_errors',
      message: 'Certaines lignes sont à corriger : rien n’a été importé.',
      fieldErrors: {},
    })
    await flushPromises()

    expect(page.find('.question-import-preview__footer [role="alert"]').text()).toBe(
      'Certaines lignes sont à corriger : rien n’a été importé.',
    )
    expect(page.findAll('.question-import-row')).toHaveLength(2)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('reads two columns pasted from a spreadsheet, then imports the same text', async () => {
    const { page, calls } = await mountImport({
      'subjects/40/question-import/preview': () => ({ data: aPreview() }),
      'subjects/40/question-import': () => ({ data: { imported: 2 } }),
    })
    const pasted = 'Pérou\tLima\nChili\tSantiago'

    await page
      .findAll('button')
      .find((button) => button.text() === 'Coller')
      ?.trigger('click')
    await page.find('textarea').setValue(pasted)
    await buttonNamed(page, 'Voir l’aperçu')?.trigger('click')
    await flushPromises()

    expect(calls.find((call) => call.path === 'subjects/40/question-import/preview')).toEqual({
      path: 'subjects/40/question-import/preview',
      method: 'POST',
      body: { text: pasted },
    })
    expect(page.findAll('.question-import-row')).toHaveLength(2)

    await buttonNamed(page, 'Importer 2 questions')?.trigger('click')
    await flushPromises()

    const confirmation = calls.find((call) => call.path === 'subjects/40/question-import')
    expect(confirmation?.body.text).toBe(pasted)
    expect(confirmation?.body.import_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(fakeUploads).toHaveLength(0)
    expect(navigateToMock).toHaveBeenCalledWith('/sujets/40/modifier')
  })

  it('sends no empty text', async () => {
    const { page, calls } = await mountImport()

    await page
      .findAll('button')
      .find((button) => button.text() === 'Coller')
      ?.trigger('click')

    expect(buttonNamed(page, 'Voir l’aperçu')?.attributes('disabled')).toBeDefined()
    expect(calls.some((call) => call.path.includes('question-import'))).toBe(false)
  })

  it('says why a pasted text cannot be read', async () => {
    const { page } = await mountImport({
      'subjects/40/question-import/preview': () => {
        throw Object.assign(new Error('Unprocessable'), {
          statusCode: 422,
          data: {
            code: 'import_single_column',
            message: 'Le recto et le verso doivent être dans deux colonnes.',
          },
        })
      },
    })

    await page
      .findAll('button')
      .find((button) => button.text() === 'Coller')
      ?.trigger('click')
    await page.find('textarea').setValue('Pérou Lima')
    await buttonNamed(page, 'Voir l’aperçu')?.trigger('click')
    await flushPromises()

    expect(page.find('[role="alert"]').text()).toBe(
      'Le recto et le verso doivent être dans deux colonnes.',
    )
  })

  it('warns that the questions reach the box 1 of the people learning the subject', async () => {
    const { page, calls } = await mountImport({
      'learning/subjects/40/learners': () => ({ has_learners: true }),
    })
    await showPreviewOf(page)

    expect(calls.some((call) => call.path === 'learning/subjects/40/learners')).toBe(true)
    expect(page.find('.question-import-preview__summary').text()).toContain(
      'Les questions importées entreront en boîte 1 chez les personnes qui apprennent ce sujet, à réviser dès aujourd’hui.',
    )
  })

  it('gives no warning on a subject nobody learns', async () => {
    const { page } = await mountImport()
    await showPreviewOf(page)

    expect(page.text()).not.toContain('boîte 1')
  })

  it('still imports when it cannot tell whether someone learns the subject', async () => {
    const { page } = await mountImport({
      'learning/subjects/40/learners': () => {
        throw Object.assign(new Error('Server error'), { statusCode: 500 })
      },
    })
    await showPreviewOf(page)

    expect(page.text()).not.toContain('boîte 1')
    expect(buttonNamed(page, 'Importer 2 questions')?.attributes('disabled')).toBeUndefined()
  })

  it('suspends the import while offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { page } = await mountImport()
    await showPreviewOf(page)

    expect(buttonNamed(page, 'Importer 2 questions')?.attributes('disabled')).toBeDefined()
    expect(page.text()).toContain('Vous êtes hors ligne : l’import reprendra avec la connexion.')
  })
})
