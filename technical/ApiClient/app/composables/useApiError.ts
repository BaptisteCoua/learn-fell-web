import type { FetchError } from 'ofetch'

export interface IApiError {
  status: number
  code: string | null
  message: string
  fieldErrors: Record<string, string>
}

interface IApiErrorBody {
  code?: string
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Turns an API failure into what a screen shows: the business rule code and its French
 * message ({ code, message }), and the first validation message of each field (422).
 */
export const useApiError = () => {
  const { t } = useI18n()

  const toApiError = (error: unknown): IApiError => {
    const fetchError = error as FetchError<IApiErrorBody>
    const body = fetchError?.data ?? {}
    const fieldErrors = Object.fromEntries(
      Object.entries(body.errors ?? {}).map(([field, messages]) => [field, messages[0] ?? '']),
    )

    return {
      status: fetchError?.statusCode ?? 0,
      code: body.code ?? null,
      message: body.message ?? t('something went wrong, please try again'),
      fieldErrors,
    }
  }

  return { toApiError }
}
