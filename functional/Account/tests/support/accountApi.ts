import { vi } from 'vitest'

export const apiFailure = (statusCode: number, data: Record<string, unknown>) =>
  Object.assign(new Error(String(data.code ?? statusCode)), { statusCode, data })

type Handler = (options: {
  method?: string
  body?: Record<string, unknown>
  query?: Record<string, string>
}) => unknown

/**
 * Replaces the API fetch. Each path answers through its handler; `/user` answers as a
 * visitor unless a handler is given.
 */
export const stubAccountApi = (handlers: Record<string, Handler>) => {
  const apiFetch = vi.fn(async (path: string, options: Parameters<Handler>[0] = {}) => {
    const handler = handlers[path]

    if (!handler) {
      throw apiFailure(401, { message: 'Unauthenticated.' })
    }

    return handler(options)
  })

  Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

  return apiFetch
}
