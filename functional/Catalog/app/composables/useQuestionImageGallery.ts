import type { IGalleryImage } from './useQuestionImageViewer'

export type GalleryLayout = 'single' | 'grid'

const SIZES: Record<GalleryLayout, string> = {
  single: '(max-width: 599px) 100vw, 600px',
  grid: '(max-width: 599px) 50vw, 300px',
}

/**
 * The images of a recto in the author's order: one across the width, two to four in a grid.
 * An image that does not load gives way to its description (FR-012).
 */
export const useQuestionImageGallery = (images: () => Iterable<IGalleryImage>) => {
  const failedIds = ref<number[]>([])

  const items = computed(() =>
    [...images()]
      .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
      .map((image) => ({ image, sources: useQuestionImageSources(image) })),
  )
  const layout = computed<GalleryLayout>(() => (items.value.length === 1 ? 'single' : 'grid'))
  const sizes = computed(() => SIZES[layout.value])

  const isFailed = (imageId: number): boolean => failedIds.value.includes(imageId)

  const markFailed = (imageId: number): void => {
    if (!isFailed(imageId)) {
      failedIds.value = [...failedIds.value, imageId]
    }
  }

  return { items, layout, sizes, isFailed, markFailed, ...useQuestionImageViewer() }
}
