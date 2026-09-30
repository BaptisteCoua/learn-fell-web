import { describe, expect, it } from 'vitest'

describe('catalog models', () => {
  it('build the lomkit search payload for a category listing', () => {
    const payload = Subject.query()
      .where('category_id', 3)
      .include('author')
      .withCount('questions')
      .limit(20)
      .buildPayload()

    expect(payload.search.filters).toEqual([{ field: 'category_id', operator: '=', value: 3 }])
    expect(payload.search.includes).toEqual([{ relation: 'author' }])
    expect(payload.search.limit).toBe(20)
  })

  it('add the search instruction', () => {
    const payload = Subject.query()
      .instruction('search', [{ name: 'q', value: 'irreguliers' }])
      .buildPayload()

    expect(payload.search.instructions).toEqual([
      { name: 'search', fields: [{ name: 'q', value: 'irreguliers' }] },
    ])
  })

  it('include the images of a question', () => {
    const payload = Question.query().include('images').buildPayload()

    expect(payload.search.includes).toEqual([{ relation: 'images' }])
  })

  it('hydrate the images of a question in their own model', () => {
    const question = Question.hydrate({
      id: 311,
      subject_id: 40,
      recto_html: '',
      verso_html: '<p>Le Grand Duc</p>',
      position: 1,
      images: [
        {
          id: 812,
          question_id: 311,
          alt: 'Hibou de face',
          position: 0,
          width: 1600,
          height: 1067,
          variant_widths: [480, 960, 1600],
        },
      ],
    })

    const [image] = Array.from(question.images)

    expect(image).toBeInstanceOf(QuestionImage)
    expect(image?.alt).toBe('Hibou de face')
    expect(image?.variant_widths).toEqual([480, 960, 1600])
  })

  it('send the images of a question as update operations with their description and position', async () => {
    const saved: unknown[] = []
    Object.assign(useNuxtApp().$laravelRaom, {
      fetch: async (_path: string, options: { body: string }) => {
        saved.push(JSON.parse(options.body))
        return { data: {} }
      },
    })
    const question = Question.hydrate({ id: 312, subject_id: 40, recto_html: '', verso_html: '' })
    const image = QuestionImage.hydrate({ id: 813, width: 480, height: 320, variant_widths: [480] })

    question.images.attach(image, () => {
      image.alt = 'Hibou en vol'
      image.position = 0
    })
    await question.save()

    expect(saved).toEqual([
      {
        mutate: [
          {
            operation: 'update',
            key: 312,
            relations: {
              images: [
                {
                  operation: 'update',
                  key: 813,
                  attributes: { alt: 'Hibou en vol', position: 0 },
                },
              ],
            },
          },
        ],
      },
    ])
  })
})
