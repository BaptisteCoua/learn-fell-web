/**
 * Whether a failed call never reached the API: no status at all, as when the device is offline.
 */
export const isNetworkError = (error: unknown): boolean => {
  const failure = error as { statusCode?: number; status?: number; response?: unknown } | null

  return (
    failure?.statusCode === undefined &&
    failure?.status === undefined &&
    failure?.response === undefined
  )
}
