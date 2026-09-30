export interface IQuestionImageSourceInput {
  id: number
  width: number
  height: number
  variant_widths: number[]
}

export interface IQuestionImageSources {
  src: string
  srcset: string
  largeSrc: string
  width: number
  height: number
}

const DEFAULT_WIDTH = 480

/**
 * The addresses of an image: the 480 px variant by default, and each variant produced for the
 * browser to pick the one that fits the screen (FR-013).
 *
 * `variant_widths` lists the widths the API serves the image at, among 480, 960 and 1600. A
 * small image is never enlarged: its largest width holds the image at its own size, which is
 * `width`, so that is what the browser is told.
 */
export const useQuestionImageSources = (
  image: IQuestionImageSourceInput,
): IQuestionImageSources => {
  const { apiBaseUrl } = useRuntimeConfig().public
  const addressAt = (servedWidth: number): string =>
    `${apiBaseUrl}/question-images/${image.id}/${servedWidth}`

  const servedWidths = [...image.variant_widths].sort((left, right) => left - right)

  return {
    src: addressAt(DEFAULT_WIDTH),
    srcset: servedWidths
      .map((servedWidth) => `${addressAt(servedWidth)} ${Math.min(servedWidth, image.width)}w`)
      .join(', '),
    largeSrc: addressAt(servedWidths.at(-1) ?? DEFAULT_WIDTH),
    width: image.width,
    height: image.height,
  }
}
