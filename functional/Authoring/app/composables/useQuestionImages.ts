import { markRaw } from 'vue'

export type QuestionImageStatus = 'uploading' | 'ready' | 'failed'

export type QuestionImageRejection = 'format' | 'limit'

export interface IQuestionImageEntry {
  key: number
  image: QuestionImage | null
  file: File | null
  localPreviewUrl: string | null
  progress: number
  status: QuestionImageStatus
  alt: string
  errorMessage: string | null
}

interface IUploadedImageResponse {
  data: { id: number; width: number; height: number; variant_widths: number[] }
}

/** The limits of contracts/api.md §1 and §3, checked before sending anything (FR-002, FR-003). */
export const MAX_IMAGES_PER_RECTO = 4
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_ALT_LENGTH = 250

/**
 * The images of the recto being written: each is sent as soon as it is chosen, with its
 * progress, then described and ordered by the author. Nothing is attached to the question
 * before it is saved, with the whole list (research R6).
 */
export const useQuestionImages = () => {
  const { t } = useI18n()
  const { upload } = useUploadRequest()

  const entries = ref<IQuestionImageEntry[]>([])
  const rejection = ref<QuestionImageRejection | null>(null)
  const isAltRequired = ref(false)
  // Images the question held when editing started, and those of them the author took off.
  const attachedKeys = new Set<number>()
  const removedImages: QuestionImage[] = []
  const aborts = new Map<number, () => void>()
  let nextKey = 0

  const isUploading = computed(() => entries.value.some((entry) => entry.status === 'uploading'))
  const hasMissingAlt = computed(() =>
    entries.value.some((entry) => entry.status === 'ready' && entry.alt.trim() === ''),
  )
  const hasImages = computed(() => entries.value.some((entry) => entry.status !== 'failed'))
  const canAdd = computed(() => entries.value.length < MAX_IMAGES_PER_RECTO)
  const rejectionMessage = computed(() => {
    if (rejection.value === 'limit') {
      return t('a recto holds at most 4 images.')
    }

    return rejection.value === 'format'
      ? t('choose a jpeg, png or webp image of 5 mb at most.')
      : null
  })

  const isAccepted = (file: File): boolean =>
    ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES

  // The API refuses a file either on its `file` field or, once decoded, with a business code
  // such as image_invalid_format for an animated image (contracts/api.md §1).
  const refusalMessage = (error: IApiError): string | null =>
    error.fieldErrors?.file ?? (error.status === 422 && error.code !== null ? error.message : null)

  const findEntry = (key: number): IQuestionImageEntry | undefined =>
    entries.value.find((entry) => entry.key === key)

  const releasePreview = (entry: IQuestionImageEntry): void => {
    if (entry.localPreviewUrl !== null) {
      URL.revokeObjectURL(entry.localPreviewUrl)
      entry.localPreviewUrl = null
    }
  }

  const stopUpload = (entry: IQuestionImageEntry): void => {
    aborts.get(entry.key)?.()
    aborts.delete(entry.key)
  }

  const forgetAttachedImage = (entry: IQuestionImageEntry): void => {
    if (entry.image && attachedKeys.has(entry.image.id)) {
      removedImages.push(entry.image)
    }
  }

  const startUpload = (key: number): void => {
    const entry = findEntry(key)

    if (!entry?.file) {
      return
    }

    entry.status = 'uploading'
    entry.progress = 0
    entry.errorMessage = null

    const request = upload<IUploadedImageResponse>('/question-images', entry.file)
    aborts.set(key, request.abort)
    const stopProgress = watch(request.progress, (progress) => {
      const uploadingEntry = findEntry(key)

      if (uploadingEntry) {
        uploadingEntry.progress = progress
      }
    })

    request.promise
      .then(({ data }) => {
        const uploadedEntry = findEntry(key)

        if (uploadedEntry) {
          uploadedEntry.image = markRaw(QuestionImage.hydrate(data))
          uploadedEntry.status = 'ready'
        }
      })
      .catch((error: unknown) => {
        const failedEntry = findEntry(key)

        if (error instanceof UploadAbortedError || !failedEntry) {
          return
        }

        failedEntry.status = 'failed'
        failedEntry.errorMessage = refusalMessage(error as IApiError)
      })
      .finally(() => {
        stopProgress()
        aborts.delete(key)
      })
  }

  const discard = (index: number): void => {
    const entry = entries.value[index]

    if (!entry) {
      return
    }

    stopUpload(entry)
    releasePreview(entry)
    entries.value.splice(index, 1)
  }

  const add = (files: File[]): void => {
    rejection.value = null

    for (const file of files) {
      if (entries.value.length >= MAX_IMAGES_PER_RECTO) {
        rejection.value = 'limit'
        return
      }

      if (!isAccepted(file)) {
        rejection.value = 'format'
        continue
      }

      const key = nextKey++
      entries.value.push({
        key,
        image: null,
        file,
        localPreviewUrl: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading',
        alt: '',
        errorMessage: null,
      })
      startUpload(key)
    }
  }

  const replace = (index: number, file: File): void => {
    const entry = entries.value[index]
    rejection.value = null

    if (!entry) {
      return
    }

    if (!isAccepted(file)) {
      rejection.value = 'format'
      return
    }

    stopUpload(entry)
    releasePreview(entry)
    forgetAttachedImage(entry)
    entry.image = null
    entry.file = file
    entry.alt = ''
    entry.localPreviewUrl = URL.createObjectURL(file)
    startUpload(entry.key)
  }

  const remove = (index: number): void => {
    const entry = entries.value[index]
    rejection.value = null

    if (entry) {
      forgetAttachedImage(entry)
      discard(index)
    }
  }

  const cancel = (index: number): void => {
    discard(index)
  }

  const retry = (index: number): void => {
    const entry = entries.value[index]

    if (entry) {
      startUpload(entry.key)
    }
  }

  const move = (index: number, step: -1 | 1): void => {
    const target = index + step

    if (target < 0 || target >= entries.value.length) {
      return
    }

    const reordered = [...entries.value]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved!)
    entries.value = reordered
  }

  const setAlt = (index: number, alt: string): void => {
    const entry = entries.value[index]

    if (entry) {
      entry.alt = alt
    }
  }

  const requireAlt = (): void => {
    isAltRequired.value = true
  }

  const reset = (): void => {
    entries.value.forEach((entry) => {
      stopUpload(entry)
      releasePreview(entry)
    })
    entries.value = []
    attachedKeys.clear()
    removedImages.splice(0, removedImages.length)
    rejection.value = null
    isAltRequired.value = false
  }

  /**
   * Starts from the images the question holds, in their order.
   */
  const start = (question?: Question): void => {
    reset()

    const questionImages = Array.from(question?.images ?? []).sort(
      (left, right) => (left.position ?? 0) - (right.position ?? 0),
    )

    entries.value = questionImages.map((image) => {
      attachedKeys.add(image.id)

      return {
        key: nextKey++,
        image: markRaw(image),
        file: null,
        localPreviewUrl: null,
        progress: 100,
        status: 'ready',
        alt: image.alt ?? '',
        errorMessage: null,
      }
    })
  }

  /**
   * Puts the whole list of images on the question to save: an update per image with its
   * description and position, and a detach per image taken off since editing started
   * (contracts/api.md §3).
   */
  const toRelationPayload = (question: Question): void => {
    const relation = question.images
    relation.clearPendingOperations()
    removedImages.forEach((image) => relation.detach(image))

    entries.value
      .filter((entry) => entry.status === 'ready' && entry.image !== null)
      .forEach((entry, position) => {
        const image = entry.image!
        relation.attach(image, () => {
          image.alt = entry.alt.trim()
          image.position = position
        })
      })
  }

  onScopeDispose(reset)

  return {
    entries,
    rejection,
    rejectionMessage,
    isAltRequired,
    isUploading,
    hasMissingAlt,
    hasImages,
    canAdd,
    add,
    replace,
    remove,
    cancel,
    retry,
    move,
    setAlt,
    requireAlt,
    start,
    toRelationPayload,
  }
}
