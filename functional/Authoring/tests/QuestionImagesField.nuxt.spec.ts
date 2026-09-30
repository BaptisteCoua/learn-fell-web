import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import QuestionImagesField from '../app/components/QuestionImagesField.vue'
import {
  aFile,
  fakeUploadRequest,
  fakeUploads,
  resetFakeUploads,
  uploadedImage,
} from './support/uploadDouble'

// The double is read when called: this mock is hoisted above the imports.
mockNuxtImport('useUploadRequest', () => () => fakeUploadRequest())

const FORMATS_MESSAGE = 'Choisissez une image au format JPEG, PNG ou WebP, de 5 Mo au plus.'

let images: ReturnType<typeof useQuestionImages>

const mountField = async () => {
  const Host = defineComponent({
    setup() {
      images = useQuestionImages()
      return () => h(QuestionImagesField, { images })
    },
  })

  return await mountSuspended(Host)
}

type Field = Awaited<ReturnType<typeof mountField>>

const choose = async (field: Field, files: File[]) => {
  const input = field.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: files, configurable: true })
  await input.trigger('change')
  await flushPromises()
}

const buttonNamed = (field: Field, label: string) =>
  field
    .findAll('button')
    .find((button) => button.attributes('aria-label') === label || button.text() === label)

const addReadyImage = async (field: Field, id: number) => {
  await choose(field, [aFile(`image-${id}.jpg`, 'image/jpeg')])
  fakeUploads.at(-1)?.succeed(uploadedImage(id))
  await flushPromises()
}

describe('QuestionImagesField', () => {
  beforeEach(() => {
    resetFakeUploads()
    Object.assign(URL, { createObjectURL: () => 'blob:preview', revokeObjectURL: vi.fn() })
  })

  it('offers the gallery and the camera of a phone: images only, no capture', async () => {
    const field = await mountField()
    const input = field.find('input[type="file"]')

    expect(input.attributes('accept')).toBe('image/jpeg,image/png,image/webp')
    expect(input.attributes('capture')).toBeUndefined()
    expect(field.text()).toContain(
      'Formats acceptés : JPEG, PNG ou WebP, 5 Mo au plus, 4 images par recto.',
    )
  })

  it.each([
    ['a GIF', aFile('anime.gif', 'image/gif')],
    ['an SVG', aFile('dessin.svg', 'image/svg+xml')],
    ['a file that is not an image', aFile('notes.txt', 'text/plain')],
    ['a file of 7 MB', aFile('lourde.jpg', 'image/jpeg', 7 * 1024 * 1024)],
  ])('refuses %s before sending it', async (_label, file) => {
    const field = await mountField()

    await choose(field, [file])

    expect(fakeUploads).toHaveLength(0)
    expect(field.find('[role="alert"]').text()).toBe(FORMATS_MESSAGE)
  })

  it('refuses a fifth image before sending it', async () => {
    const field = await mountField()

    await choose(
      field,
      [1, 2, 3, 4, 5].map((id) => aFile(`image-${id}.jpg`, 'image/jpeg')),
    )

    expect(fakeUploads).toHaveLength(4)
    expect(field.find('[role="alert"]').text()).toBe('Un recto porte au plus 4 images.')
    expect(buttonNamed(field, 'Ajouter une image')?.attributes('disabled')).toBeDefined()
  })

  it('shows the progress of an upload and cancels it', async () => {
    const field = await mountField()

    await choose(field, [aFile('hibou.jpg', 'image/jpeg')])
    fakeUploads[0]!.progress.value = 40
    await flushPromises()

    expect(fakeUploads[0]?.path).toBe('/question-images')
    expect(field.find('[role="progressbar"]').attributes('aria-valuenow')).toBe('40')
    expect(images.isUploading.value).toBe(true)

    await buttonNamed(field, "Annuler l'envoi")?.trigger('click')
    await flushPromises()

    expect(fakeUploads[0]?.isAborted).toBe(true)
    expect(field.find('.question-image-row').exists()).toBe(false)
    expect(images.isUploading.value).toBe(false)
  })

  it('reports a failed upload, keeps the rest, and tries again', async () => {
    const field = await mountField()
    await addReadyImage(field, 812)

    await choose(field, [aFile('hibou.jpg', 'image/jpeg')])
    fakeUploads[1]?.fail({ status: 0, code: null, message: 'Erreur', fieldErrors: {} })
    await flushPromises()

    expect(field.text()).toContain("L'envoi de l'image a échoué.")
    expect(field.findAll('.question-image-row')).toHaveLength(2)

    await buttonNamed(field, 'Réessayer')?.trigger('click')
    await flushPromises()

    expect(fakeUploads).toHaveLength(3)
    expect(fakeUploads[2]?.file.name).toBe('hibou.jpg')
  })

  it('shows the message of the API for a file it refuses', async () => {
    const field = await mountField()

    await choose(field, [aFile('text-renamed.jpg', 'image/jpeg')])
    fakeUploads[0]?.fail({
      status: 422,
      code: null,
      message: 'Choisissez une image au format JPEG, PNG ou WebP.',
      fieldErrors: { file: 'Choisissez une image au format JPEG, PNG ou WebP.' },
    })
    await flushPromises()

    expect(field.text()).toContain('Choisissez une image au format JPEG, PNG ou WebP.')
  })

  it('shows the message of the API for an animated or unreadable image', async () => {
    const field = await mountField()

    await choose(field, [aFile('anime.webp', 'image/webp')])
    fakeUploads[0]?.fail({
      status: 422,
      code: 'image_invalid_format',
      message: 'Choisissez une image au format JPEG, PNG ou WebP.',
      fieldErrors: {},
    })
    await flushPromises()

    expect(field.text()).toContain('Choisissez une image au format JPEG, PNG ou WebP.')
  })

  it('asks for a description of at most 250 characters', async () => {
    const field = await mountField()
    await addReadyImage(field, 812)

    const description = field.find('textarea')
    expect(description.attributes('maxlength')).toBe('250')
    expect(field.text()).toContain('0 / 250')

    await description.setValue('Hibou de face')

    expect(images.entries.value[0]?.alt).toBe('Hibou de face')
    expect(field.text()).toContain('13 / 250')
  })

  it('shows which image lacks a description once saving is attempted', async () => {
    const field = await mountField()
    await addReadyImage(field, 812)

    expect(field.text()).not.toContain('Décrivez cette image.')

    images.requireAlt()
    await flushPromises()

    expect(field.text()).toContain('Décrivez cette image.')
  })

  it('moves an image up and down with named arrows', async () => {
    const field = await mountField()
    await addReadyImage(field, 1)
    await addReadyImage(field, 2)

    expect(buttonNamed(field, "Monter l'image 1")?.attributes('disabled')).toBeDefined()
    expect(buttonNamed(field, "Descendre l'image 2")?.attributes('disabled')).toBeDefined()

    await buttonNamed(field, "Monter l'image 2")?.trigger('click')

    expect(images.entries.value.map((entry) => entry.image?.id)).toEqual([2, 1])

    await buttonNamed(field, "Descendre l'image 1")?.trigger('click')

    expect(images.entries.value.map((entry) => entry.image?.id)).toEqual([1, 2])
  })

  it('replaces an image with another file', async () => {
    const field = await mountField()
    await addReadyImage(field, 1)

    const replaceInput = field.find('.question-image-row input[type="file"]')
    expect(buttonNamed(field, 'Remplacer')).toBeDefined()
    Object.defineProperty(replaceInput.element, 'files', {
      value: [aFile('autre.png', 'image/png')],
      configurable: true,
    })
    await replaceInput.trigger('change')
    await flushPromises()

    expect(fakeUploads).toHaveLength(2)
    expect(fakeUploads[1]?.file.name).toBe('autre.png')
    expect(field.findAll('.question-image-row')).toHaveLength(1)
  })

  it('removes an image', async () => {
    const field = await mountField()
    await addReadyImage(field, 1)

    await buttonNamed(field, 'Retirer')?.trigger('click')

    expect(field.find('.question-image-row').exists()).toBe(false)
    expect(images.hasImages.value).toBe(false)
  })

  it('suspends adding images while offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    try {
      const field = await mountField()
      await flushPromises()

      expect(buttonNamed(field, 'Ajouter une image')?.attributes('disabled')).toBeDefined()
    } finally {
      Reflect.deleteProperty(navigator, 'onLine')
    }
  })
})
