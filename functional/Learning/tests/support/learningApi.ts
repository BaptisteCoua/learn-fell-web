import { vi } from 'vitest'

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

export interface IApiCall {
  path: string
  body: Record<string, unknown>
}

type Handler = (call: IApiCall) => unknown

const SUBJECT = {
  id: 25,
  title: 'Verbes irréguliers',
  status: 'published',
  category: { id: 1, name: 'Langues' },
}

export const aLearning = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  subject_id: 25,
  created_at: '2026-09-20T08:00:00Z',
  due_today_count: 2,
  box_1_count: 2,
  box_2_count: 1,
  box_3_count: 0,
  box_4_count: 0,
  box_5_count: 0,
  next_review_on: '2026-09-25',
  subject: SUBJECT,
  ...overrides,
})

export const aCard = (id: number, box = 1) => ({
  id,
  subject_id: 25,
  question_id: 100 + id,
  box,
  next_review_on: '2026-09-25',
  last_answered_at: null,
  subject: SUBJECT,
  question: {
    id: 100 + id,
    subject_id: 25,
    recto_html: `<p>Recto ${id}</p>`,
    verso_html: `<p>Verso ${id}</p>`,
    position: id,
  },
})

/**
 * Replaces the API fetch; a search answers one page of what its handler returns.
 */
export const stubLearningApi = (handlers: Record<string, Handler>) => {
  const calls: IApiCall[] = []
  const apiFetch = vi.fn(async (rawPath: string, options: { body?: string } = {}) => {
    const path = rawPath.replace(/^\//, '')
    const call = { path, body: JSON.parse(options.body ?? '{}') }
    calls.push(call)
    const handler = handlers[path]

    if (!handler) {
      throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 })
    }

    const result = handler(call)

    return path.endsWith('/search')
      ? { data: result, current_page: 1, last_page: 1, total: (result as unknown[]).length }
      : result
  })

  Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

  return calls
}

export const signIn = () => {
  useSessionStore().user = {
    id: 7,
    display_name: 'Inès Martin',
    email: 'ines@exemple.fr',
    permissions: [],
  }
}
