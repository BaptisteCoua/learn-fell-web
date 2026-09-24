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
})
