import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import QuestionImageGallery from '../app/components/QuestionImageGallery.vue'

// Vuetify's dialogs read the visual viewport, which happy-dom does not provide.
vi.stubGlobal('visualViewport', {
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  scale: 1,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
})

const API = 'http://localhost:8090/api'

const anImage = (id: number, position: number, alt = `Image ${id}`) => ({
  id,
  question_id: 311,
  alt,
  position,
  width: 1600,
  height: 1067,
  variant_widths: [480, 960, 1600],
})

const mountGallery = (props: Record<string, unknown>) =>
  mountSuspended(QuestionImageGallery, { props, attachTo: document.body })

const viewer = () => document.body.querySelector('[role="dialog"]')

describe('QuestionImageGallery', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows nothing without images', async () => {
    const gallery = await mountGallery({ images: [] })

    expect(gallery.find('img').exists()).toBe(false)
    expect(gallery.find('.question-image-gallery').exists()).toBe(false)
  })

  it('shows one image across the whole width, with its variants and its description', async () => {
    const gallery = await mountGallery({ images: [anImage(812, 0, 'Hibou de face')] })
    const image = gallery.find('img')

    expect(gallery.find('.question-image-gallery--single').exists()).toBe(true)
    expect(image.attributes()).toMatchObject({
      src: `${API}/question-images/812/480`,
      srcset: `${API}/question-images/812/480 480w, ${API}/question-images/812/960 960w, ${API}/question-images/812/1600 1600w`,
      sizes: '(max-width: 599px) 100vw, 600px',
      width: '1600',
      height: '1067',
      alt: 'Hibou de face',
      crossorigin: 'use-credentials',
      loading: 'lazy',
    })
  })

  it('shows two to four images in a grid, in the order chosen by the author', async () => {
    const gallery = await mountGallery({
      images: [anImage(3, 2), anImage(1, 0), anImage(2, 1)],
    })
    const images = gallery.findAll('img')

    expect(gallery.find('.question-image-gallery--grid').exists()).toBe(true)
    expect(images.map((image) => image.attributes('alt'))).toEqual([
      'Image 1',
      'Image 2',
      'Image 3',
    ])
    expect(images[0]?.attributes('sizes')).toBe('(max-width: 599px) 50vw, 300px')
  })

  it('loads the images at once when asked', async () => {
    const gallery = await mountGallery({ images: [anImage(812, 0)], eager: true })

    expect(gallery.find('img').attributes('loading')).toBe('eager')
  })

  it('enlarges an image from a button named after its description', async () => {
    const gallery = await mountGallery({ images: [anImage(812, 0, 'Hibou de face')] })
    const trigger = gallery.find('button')

    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('aria-label')).toBe("Agrandir l'image : Hibou de face")

    await trigger.trigger('click')
    await flushPromises()

    const enlarged = viewer()?.querySelector('img')
    expect(enlarged?.getAttribute('src')).toBe(`${API}/question-images/812/1600`)
    expect(enlarged?.getAttribute('alt')).toBe('Hibou de face')
    expect(enlarged?.getAttribute('crossorigin')).toBe('use-credentials')
    expect(viewer()?.textContent).toContain('Hibou de face')
  })

  it('closes the enlarged image with Escape and gives the focus back to the image', async () => {
    const gallery = await mountGallery({ images: [anImage(812, 0)] })
    const trigger = gallery.find('button')
    ;(trigger.element as HTMLButtonElement).focus()

    await trigger.trigger('click')
    await flushPromises()
    expect(viewer()).not.toBeNull()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger.element))
    expect(document.body.querySelector('.question-image-viewer__figure')).toBeNull()
  })

  it('closes the enlarged image with its button', async () => {
    const gallery = await mountGallery({ images: [anImage(812, 0)] })
    const trigger = gallery.find('button')

    await trigger.trigger('click')
    await flushPromises()

    const close = Array.from(viewer()?.querySelectorAll('button') ?? []).find(
      (button) => button.textContent?.trim() === 'Fermer',
    )
    expect(close).toBeDefined()
    close?.click()
    await flushPromises()

    await vi.waitFor(() => expect(document.activeElement).toBe(trigger.element))
  })

  it('shows the description in place of an image that does not load', async () => {
    const gallery = await mountGallery({
      images: [anImage(1, 0, 'Hibou de face'), anImage(2, 1, 'Hibou en vol')],
    })

    await gallery.findAll('img')[0]?.trigger('error')

    expect(gallery.findAll('img')).toHaveLength(1)
    expect(gallery.find('.question-image-gallery__fallback').text()).toBe(
      'Image non chargée : Hibou de face',
    )
    expect(gallery.find('.question-image-gallery--grid').exists()).toBe(true)
  })
})
