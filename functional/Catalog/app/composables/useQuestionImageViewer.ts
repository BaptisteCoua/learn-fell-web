import type { IQuestionImageSourceInput } from './useQuestionImageSources'

export interface IGalleryImage extends IQuestionImageSourceInput {
  alt: string | null
  position: number | null
}

/**
 * One image shown full screen (FR-011). Closing gives the focus back to what opened it, so a
 * keyboard user carries on from the same image.
 */
export const useQuestionImageViewer = () => {
  const viewedImage = shallowRef<IGalleryImage | null>(null)
  let trigger: HTMLElement | null = null

  const close = (): void => {
    viewedImage.value = null
    const focusTarget = trigger
    trigger = null
    nextTick(() => focusTarget?.focus())
  }

  const open = (image: IGalleryImage, triggerElement: EventTarget | null): void => {
    trigger = triggerElement instanceof HTMLElement ? triggerElement : null
    viewedImage.value = image
  }

  const viewedImageSrc = computed(() =>
    viewedImage.value ? useQuestionImageSources(viewedImage.value).largeSrc : null,
  )

  const isOpen = computed({
    get: () => viewedImage.value !== null,
    set: (shouldOpen: boolean) => {
      if (!shouldOpen && viewedImage.value !== null) {
        close()
      }
    },
  })

  return { viewedImage, viewedImageSrc, isOpen, open, close }
}
