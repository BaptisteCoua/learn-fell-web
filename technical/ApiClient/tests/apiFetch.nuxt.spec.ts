import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it } from 'vitest'

const API_ORIGIN = 'http://localhost:8090'
const EXPIRED_XSRF_COOKIE = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'

let unregisterEndpoints: (() => void)[] = []

/**
 * An API that hands out `renewedToken` from /sanctum/csrf-cookie and only accepts `acceptedToken`.
 * The test runtime drops request headers on the way to a stubbed endpoint, so the endpoint reads
 * the token the browser holds, which is the one the fetch sends. Returns the token of each search.
 */
const stubApi = ({
  renewedToken,
  acceptedToken,
}: {
  renewedToken: string
  acceptedToken: string
}) => {
  const searchTokens: (string | null)[] = []

  unregisterEndpoints = [
    registerEndpoint(`${API_ORIGIN}/sanctum/csrf-cookie`, () => {
      document.cookie = `XSRF-TOKEN=${renewedToken}; path=/`
      return new Response(null, { status: 204 })
    }),
    registerEndpoint(`${API_ORIGIN}/api/subjects/search`, () => {
      const heldToken = readXsrfToken(document.cookie)
      searchTokens.push(heldToken)

      return heldToken === acceptedToken
        ? Response.json({ data: [] })
        : Response.json({ message: 'CSRF token mismatch.' }, { status: 419 })
    }),
  ]

  return searchTokens
}

const searchSubjects = () =>
  useNuxtApp().$laravelRaom.fetch('/subjects/search', { method: 'POST', body: {} })

describe('the API fetch', () => {
  afterEach(() => {
    unregisterEndpoints.forEach((unregister) => unregister())
    document.cookie = EXPIRED_XSRF_COOKIE
  })

  it('renews an XSRF token the API rejects and sends the request once more', async () => {
    document.cookie = 'XSRF-TOKEN=stale; path=/'
    const searchTokens = stubApi({ renewedToken: 'fresh', acceptedToken: 'fresh' })

    await expect(searchSubjects()).resolves.toEqual({ data: [] })

    expect(searchTokens).toEqual(['stale', 'fresh'])
  })

  it('gives up when the renewed token is rejected too', async () => {
    document.cookie = 'XSRF-TOKEN=stale; path=/'
    const searchTokens = stubApi({ renewedToken: 'still-stale', acceptedToken: 'fresh' })

    await expect(searchSubjects()).rejects.toMatchObject({ statusCode: 419 })

    expect(searchTokens).toEqual(['stale', 'still-stale'])
  })
})
