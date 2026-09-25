const XSRF_COOKIE = 'XSRF-TOKEN'

export const readXsrfToken = (cookieHeader: string): string | null => {
  const entry = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${XSRF_COOKIE}=`))

  return entry ? decodeURIComponent(entry.slice(XSRF_COOKIE.length + 1)) : null
}

export const isMutatingMethod = (method: string | undefined): boolean =>
  !['GET', 'HEAD', 'OPTIONS'].includes((method ?? 'GET').toUpperCase())
