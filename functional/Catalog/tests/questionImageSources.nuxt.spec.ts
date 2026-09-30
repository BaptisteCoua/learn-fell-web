import { describe, expect, it } from 'vitest'

const API = 'http://localhost:8090/api'

const anImage = (variantWidths: number[], width = 1600, height = 1067) => ({
  id: 812,
  alt: 'Hibou de face',
  position: 0,
  width,
  height,
  variant_widths: variantWidths,
})

describe('useQuestionImageSources', () => {
  it('builds the addresses of every variant of an image', () => {
    expect(useQuestionImageSources(anImage([480, 960, 1600]))).toEqual({
      src: `${API}/question-images/812/480`,
      srcset: `${API}/question-images/812/480 480w, ${API}/question-images/812/960 960w, ${API}/question-images/812/1600 1600w`,
      largeSrc: `${API}/question-images/812/1600`,
      width: 1600,
      height: 1067,
    })
  })

  it('lists only the variants that were produced', () => {
    const sources = useQuestionImageSources(anImage([480, 960], 960, 640))

    expect(sources.srcset).toBe(
      `${API}/question-images/812/480 480w, ${API}/question-images/812/960 960w`,
    )
    expect(sources.largeSrc).toBe(`${API}/question-images/812/960`)
  })

  it('describes the largest variant of a small image at its own width', () => {
    const sources = useQuestionImageSources(anImage([480, 960], 700, 400))

    expect(sources.srcset).toBe(
      `${API}/question-images/812/480 480w, ${API}/question-images/812/960 700w`,
    )
    expect(sources.largeSrc).toBe(`${API}/question-images/812/960`)
  })
})
