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

/**
 * Replaces the API fetch; a search answers one page of what its handler returns.
 */
export const stubApi = (handlers: Record<string, (call: IApiCall) => unknown>) => {
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

export const dialogText = (): string =>
  [...document.body.querySelectorAll('.report-subject__panel, .retire-subject, .confirm-dialog')]
    .map((element) => element.textContent ?? '')
    .join(' ')
