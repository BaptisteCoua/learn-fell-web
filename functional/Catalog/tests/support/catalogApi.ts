import { vi } from 'vitest'

export interface ISearchBody {
  search: {
    filters?: { field: string; value: unknown }[]
    instructions?: { name: string; fields: { name: string; value: string }[] }[]
    page?: number
  }
}

type SearchHandler = (body: ISearchBody) => unknown[]

export const CATEGORY = { id: 3, name: 'Histoire', position: 1, subjects_count: 2 }

export const aSubject = (overrides: Record<string, unknown> = {}) => ({
  id: 40,
  title: 'Dates clés de la Révolution',
  description: 'De la prise de la Bastille au Directoire.',
  status: 'published',
  category_id: CATEGORY.id,
  author_id: 6,
  published_at: '2026-09-12T08:00:00Z',
  retired_reason: null,
  retired_at: null,
  created_at: '2026-09-10T08:00:00Z',
  updated_at: '2026-09-12T08:00:00Z',
  questions_count: 2,
  author: { id: 6, display_name: 'Léa Moreau' },
  category: CATEGORY,
  tags: [{ id: 1, name: 'révolution' }],
  ...overrides,
})

export const aQuestion = (id: number, position: number) => ({
  id,
  subject_id: 40,
  recto_html: `<p>Question ${position}</p>`,
  verso_html: `<p>Réponse ${position}</p>`,
  position,
})

const page = (data: unknown[]) => ({
  data,
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: data.length,
})

/**
 * Replaces the API fetch shared by the models and the session store. Each resource answers
 * through its handler; anything else (such as `/user`) fails, so the viewer is a visitor.
 */
export const stubCatalogApi = (handlers: Record<string, SearchHandler>) => {
  const apiFetch = vi.fn(async (url: string, options?: { body?: string }) => {
    const resource = url.replace(/^\//, '').replace(/\/search$/, '')
    const handler = handlers[resource]

    if (!handler) {
      throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 })
    }

    return page(handler(JSON.parse(options?.body ?? '{"search":{}}')))
  })

  Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

  return apiFetch
}
