import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import SubjectEditorPage from '../app/pages/sujets/[id]/modifier.vue'
import {
  aQuestion,
  aQuestionImage,
  aSubject,
  CATEGORY,
  dialogText,
  signInAsAuthor,
  stubAuthoringApi,
  type IApiCall,
} from './support/authoringApi'
import {
  aFile,
  fakeUploadRequest,
  fakeUploads,
  resetFakeUploads,
  uploadedImage,
} from './support/uploadDouble'

// The double is read when called: this mock is hoisted above the imports.
mockNuxtImport('useUploadRequest', () => () => fakeUploadRequest())

const mountEditor = async (
  subject = aSubject(),
  questions = [aQuestion(401, 1), aQuestion(402, 2)],
) => {
  const calls = stubAuthoringApi({
    'subjects/search': () => [subject],
    'questions/search': () => questions,
    'categories/search': () => [CATEGORY],
    'questions/actions/reorder': () => ({ data: { impacted: 0 } }),
  })
  const page = await mountSuspended(SubjectEditorPage, { route: `/sujets/${subject.id}/modifier` })

  return { page, calls }
}

const buttonNamed = (page: Awaited<ReturnType<typeof mountEditor>>['page'], label: string) =>
  page
    .findAll('button')
    .find((button) => button.attributes('aria-label') === label || button.text() === label)

const importLink = (page: Awaited<ReturnType<typeof mountEditor>>['page']) =>
  page
    .findAllComponents({ name: 'VBtn' })
    .find((button) => button.text() === 'Importer des questions')

describe('SubjectEditor', () => {
  beforeEach(() => {
    signInAsAuthor()
  })

  it('shows the subject fields and its questions', async () => {
    const { page } = await mountEditor()

    expect(page.find('input').element.value).toBe('Git : les commandes essentielles')
    expect(page.findAll('.question-card')).toHaveLength(2)
    expect(page.text()).toContain('Questions · 2')
  })

  it('opens the import of questions', async () => {
    const { page } = await mountEditor()

    expect(importLink(page)?.props('to')).toBe('/sujets/40/importer')
  })

  it('offers no import on a subject retired by the moderation', async () => {
    const { page } = await mountEditor(aSubject({ status: 'retired', retired_reason: 'Spam' }))

    expect(importLink(page)).toBeUndefined()
  })

  it('moves a question and sends the new order', async () => {
    const { page, calls } = await mountEditor()

    await buttonNamed(page, 'Monter la question 02')?.trigger('click')
    await flushPromises()

    expect(calls.find((call) => call.path === 'questions/actions/reorder')?.body).toEqual({
      fields: [
        { name: 'subject_id', value: 40 },
        { name: 'ids', value: [402, 401] },
      ],
    })
  })

  it('keeps the last question of a published subject', async () => {
    const { page, calls } = await mountEditor(aSubject({ status: 'published' }), [
      aQuestion(401, 1),
    ])

    await buttonNamed(page, 'Supprimer la question 01')?.trigger('click')
    await flushPromises()

    expect(dialogText()).toContain('Un sujet publié doit garder au moins une question.')
    expect(calls.some((call) => call.method === 'DELETE')).toBe(false)
  })

  it('asks for a recto and a verso before saving a new question', async () => {
    const { page, calls } = await mountEditor()

    await buttonNamed(page, 'Ajouter une question')?.trigger('click')
    await buttonNamed(page, 'Enregistrer la question')?.trigger('click')
    await flushPromises()

    expect(page.text()).toContain('Le recto et le verso sont obligatoires.')
    expect(calls.some((call) => call.path === 'questions/mutate')).toBe(false)
  })

  it('shows a retired subject read-only with its reason', async () => {
    const { page } = await mountEditor(
      aSubject({ status: 'retired', retired_reason: 'Contenu recopié.' }),
    )

    expect(page.text()).toContain('Sujet retiré par la modération.')
    expect(page.text()).toContain('Motif : « Contenu recopié. ».')
    expect(buttonNamed(page, 'Ajouter une question')).toBeUndefined()
    expect(buttonNamed(page, 'Modifier la question 01')).toBeUndefined()
  })

  describe('with images', () => {
    type Page = Awaited<ReturnType<typeof mountEditor>>['page']

    const RECTO_EMPTY = Object.assign(new Error('Unprocessable'), {
      statusCode: 422,
      data: { code: 'recto_empty', message: 'Ajoutez un texte ou une image au recto.' },
    })

    const mountWithImages = async (
      question = aQuestion(401, 1, {
        images: [aQuestionImage(901, 0, 'Hibou de face'), aQuestionImage(902, 1, 'Hibou en vol')],
      }),
      onMutate: (call: IApiCall) => unknown = () => ({ data: {} }),
    ) => {
      const calls = stubAuthoringApi({
        'subjects/search': () => [aSubject()],
        'questions/search': () => [question],
        'categories/search': () => [CATEGORY],
        'questions/mutate': onMutate,
      })
      const page = await mountSuspended(SubjectEditorPage, { route: '/sujets/40/modifier' })

      return { page, calls }
    }

    const choose = async (page: Page, selector: string, file: File) => {
      const input = page.find(selector)
      Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
      await input.trigger('change')
      await flushPromises()
    }

    const save = async (page: Page) => {
      await buttonNamed(page, 'Enregistrer la question')?.trigger('click')
      await flushPromises()
    }

    const mutation = (calls: IApiCall[]) =>
      (calls.find((call) => call.path === 'questions/mutate')?.body.mutate as unknown[])?.[0]

    beforeEach(() => {
      resetFakeUploads()
      Object.assign(URL, {
        createObjectURL: () => 'blob:preview',
        revokeObjectURL: () => undefined,
      })
    })

    it('loads the images with the questions and shows them on their card', async () => {
      const { page, calls } = await mountWithImages()

      const search = calls.find((call) => call.path === 'questions/search')
      expect((search?.body.search as { includes: unknown }).includes).toEqual([
        { relation: 'images' },
      ])
      expect(page.findAll('.question-card img').map((image) => image.attributes('alt'))).toEqual([
        'Hibou de face',
        'Hibou en vol',
      ])
    })

    it('saves the whole list of images, in their new order, with their description', async () => {
      const { page, calls } = await mountWithImages()

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await buttonNamed(page, "Monter l'image 2")?.trigger('click')
      await save(page)

      expect(mutation(calls)).toEqual({
        operation: 'update',
        key: 401,
        attributes: { recto_html: '<p>Question 1</p>', verso_html: '<p>Réponse 1</p>' },
        relations: {
          images: [
            { operation: 'update', key: 902, attributes: { alt: 'Hibou en vol', position: 0 } },
            { operation: 'update', key: 901, attributes: { alt: 'Hibou de face', position: 1 } },
          ],
        },
      })
    })

    it('saves a recto with an image and no text', async () => {
      const { page, calls } = await mountWithImages(
        aQuestion(401, 1, { recto_html: '', images: [aQuestionImage(901, 0, 'Hibou de face')] }),
      )

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await save(page)

      expect(mutation(calls)).toMatchObject({
        attributes: { recto_html: '' },
        relations: {
          images: [
            { operation: 'update', key: 901, attributes: { alt: 'Hibou de face', position: 0 } },
          ],
        },
      })
      expect(page.text()).not.toContain('Le recto et le verso sont obligatoires.')
    })

    it('sends a new image once uploaded and described', async () => {
      const { page, calls } = await mountWithImages(aQuestion(401, 1))

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await choose(page, '.question-images-field__input', aFile('hibou.jpg', 'image/jpeg'))
      fakeUploads[0]?.succeed(uploadedImage(950))
      await flushPromises()
      await page.find('.question-image-row textarea').setValue('  Hibou de face  ')
      await save(page)

      expect(mutation(calls)).toMatchObject({
        relations: {
          images: [
            { operation: 'update', key: 950, attributes: { alt: 'Hibou de face', position: 0 } },
          ],
        },
      })
    })

    it('does not save while an image is uploading', async () => {
      const { page, calls } = await mountWithImages(aQuestion(401, 1))

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await choose(page, '.question-images-field__input', aFile('hibou.jpg', 'image/jpeg'))
      await save(page)

      expect(calls.some((call) => call.path === 'questions/mutate')).toBe(false)
      expect(page.text()).toContain("Attendez la fin de l'envoi des images.")
    })

    it('does not save while an image lacks its description', async () => {
      const { page, calls } = await mountWithImages(aQuestion(401, 1))

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await choose(page, '.question-images-field__input', aFile('hibou.jpg', 'image/jpeg'))
      fakeUploads[0]?.succeed(uploadedImage(950))
      await flushPromises()
      await save(page)

      expect(calls.some((call) => call.path === 'questions/mutate')).toBe(false)
      expect(page.text()).toContain('Décrivez cette image.')
    })

    it('shows the message of an empty recto refused by the API', async () => {
      const { page } = await mountWithImages(aQuestion(401, 1, { recto_html: '<p> </p>' }), () => {
        throw RECTO_EMPTY
      })

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await save(page)

      expect(page.text()).toContain('Ajoutez un texte ou une image au recto.')
      expect(page.text()).not.toContain('Enregistrement impossible.')
    })

    it('asks for a text or an image when the last image of an image-only recto is taken off', async () => {
      const { page, calls } = await mountWithImages(
        aQuestion(401, 1, { recto_html: '', images: [aQuestionImage(901, 0, 'Hibou de face')] }),
      )

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await buttonNamed(page, "Retirer l'image 1")?.trigger('click')
      await save(page)

      expect(page.text()).toContain('Ajoutez un texte ou une image au recto.')
      expect(page.text()).not.toContain('Le recto et le verso sont obligatoires.')
      expect(calls.some((call) => call.path === 'questions/mutate')).toBe(false)
    })

    it('detaches the last image taken off a question that has a text', async () => {
      const { page, calls } = await mountWithImages(
        aQuestion(401, 1, { images: [aQuestionImage(901, 0, 'Hibou de face')] }),
      )

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await buttonNamed(page, "Retirer l'image 1")?.trigger('click')
      await save(page)

      expect(mutation(calls)).toMatchObject({
        relations: { images: [{ operation: 'detach', key: 901 }] },
      })
    })

    it('detaches a replaced image and sends the new one', async () => {
      const { page, calls } = await mountWithImages(
        aQuestion(401, 1, { images: [aQuestionImage(901, 0, 'Hibou de face')] }),
      )

      await buttonNamed(page, 'Modifier la question 01')?.trigger('click')
      await choose(page, '.question-image-row__input', aFile('autre.png', 'image/png'))
      fakeUploads[0]?.succeed(uploadedImage(950))
      await flushPromises()
      await page.find('.question-image-row textarea').setValue('Hibou en vol')
      await save(page)

      expect(mutation(calls)).toMatchObject({
        relations: {
          images: [
            { operation: 'detach', key: 901 },
            { operation: 'update', key: 950, attributes: { alt: 'Hibou en vol', position: 0 } },
          ],
        },
      })
    })
  })

  it("reports someone else's subject as not found", async () => {
    stubAuthoringApi({
      'subjects/search': () => [aSubject({ author_id: 99 })],
      'questions/search': () => [],
      'categories/search': () => [CATEGORY],
    })

    let failure: unknown = null
    const Probe = defineComponent({
      async setup() {
        failure = await useSubjectEditor(40).then(
          () => null,
          (error: unknown) => error,
        )
        return () => h('div')
      },
    })

    await mountSuspended(Probe)

    expect(failure).toMatchObject({ statusCode: 404 })
  })
})
