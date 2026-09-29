const XSRF_COOKIE = 'XSRF-TOKEN'

/**
 * Laravel's answer when the XSRF token does not match the session, rejected before any work is done.
 */
export const CSRF_TOKEN_MISMATCH = 419

export const readXsrfToken = (cookieHeader: string): string | null => {
  const entry = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${XSRF_COOKIE}=`))

  return entry ? decodeURIComponent(entry.slice(XSRF_COOKIE.length + 1)) : null
}

/**
 * Every call to /sanctum/csrf-cookie opens a new session. Requests sent together share one call,
 * otherwise each would read the XSRF token of a session the browser no longer holds.
 */
export const createXsrfCookieFetcher = (fetchCookie: () => Promise<unknown>) => {
  let pendingFetch: Promise<unknown> | null = null

  return async (): Promise<void> => {
    pendingFetch ??= fetchCookie().finally(() => {
      pendingFetch = null
    })
    await pendingFetch
  }
}

export const isMutatingMethod = (method: string | undefined): boolean =>
  !['GET', 'HEAD', 'OPTIONS'].includes((method ?? 'GET').toUpperCase())
