import type { IQuestionImageEntry } from './useQuestionImages'

interface IQuestionImageRowProps {
  entry: IQuestionImageEntry
  index: number
  isAltRequired: boolean
}

/**
 * One image of the recto being written: its number for the labels, whether its description is
 * missing once saving was attempted, and its preview — the local file until the upload is done,
 * then the served variant.
 */
export const useQuestionImageRow = (props: IQuestionImageRowProps) => {
  const number = computed(() => props.index + 1)
  const hasAltError = computed(() => props.isAltRequired && props.entry.alt.trim() === '')
  const previewSrc = computed(
    () =>
      props.entry.localPreviewUrl ??
      (props.entry.image ? useQuestionImageSources(props.entry.image).src : null),
  )

  return { number, hasAltError, previewSrc }
}
