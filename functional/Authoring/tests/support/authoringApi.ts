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
  method: string
  body: Record<string, unknown>
}

type Handler = (call: IApiCall) => unknown

export const AUTHOR = {
  id: 6,
  display_name: 'Camille Roux',
  email: 'camille@exemple.fr',
  permissions: [],
}
export const CATEGORY = { id: 3, name: 'Informatique', position: 1, subjects_count: 1 }

export const aSubject = (overrides: Record<string, unknown> = {}) => ({
  id: 40,
  title: 'Git : les commandes essentielles',
  description: 'Branches et commits.',
  status: 'draft',
  category_id: CATEGORY.id,
  author_id: AUTHOR.id,
  published_at: null,
  retired_reason: null,
  retired_at: null,
  created_at: '2026-09-20T08:00:00Z',
  updated_at: '2026-09-24T08:00:00Z',
  questions_count: 2,
  author: { id: AUTHOR.id, display_name: AUTHOR.display_name },
  category: CATEGORY,
  tags: [{ id: 1, name: 'git' }],
  ...overrides,
})

export const aQuestion = (id: number, position: number) => ({
  id,
  subject_id: 40,
  recto_html: `<p>Question ${position}</p>`,
  verso_html: `<p>Réponse ${position}</p>`,
  position,
})

/**
 * Replaces the API fetch. Paths are the lomkit ones (`subjects/search`, `subjects/actions/publish`);
 * a search answers one page of what its handler returns.
 */
export const stubAuthoringApi = (handlers: Record<string, Handler>) => {
  const calls: IApiCall[] = []
  const apiFetch = vi.fn(
    async (rawPath: string, options: { method?: string; body?: string } = {}) => {
      const path = rawPath.replace(/^\//, '')
      const call = { path, method: options.method ?? 'GET', body: JSON.parse(options.body ?? '{}') }
      calls.push(call)
      const handler = handlers[path]

      if (!handler) {
        throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 })
      }

      const result = handler(call)

      return path.endsWith('/search')
        ? { data: result, current_page: 1, last_page: 1, total: (result as unknown[]).length }
        : result
    },
  )

  Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

  return calls
}

export const signInAsAuthor = () => {
  useSessionStore().user = { ...AUTHOR }
}

/** Dialogs are teleported to the body. */
export const dialogText = (): string =>
  document.body.querySelector('.confirm-dialog')?.textContent ?? ''
