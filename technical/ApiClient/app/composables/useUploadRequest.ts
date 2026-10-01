import type { Ref } from 'vue'
import type { IApiError } from './useApiError'

export interface IUploadRequest<TResponse> {
  progress: Ref<number>
  promise: Promise<TResponse>
  abort: () => void
}

/**
 * Rejection of an upload the user cancelled, so it is not reported as a failure.
 */
export class UploadAbortedError extends Error {
  constructor() {
    super('Upload aborted')
    this.name = 'UploadAbortedError'
  }
}

const parseBody = (responseText: string): Record<string, unknown> => {
  try {
    return JSON.parse(responseText)
  } catch {
    return {}
  }
}

/**
 * Sends one file to a non-lomkit endpoint (`multipart/form-data`, field `file`, plus the given
 * fields) with the session cookie and the XSRF header, reporting its progress and allowing to
 * cancel it — which neither raom nor `$fetch` offer (research R5).
 */
export const useUploadRequest = () => {
  const nuxtApp = useNuxtApp()
  const { apiBaseUrl } = useRuntimeConfig().public
  const { toApiError } = useApiError()

  const upload = <TResponse>(
    path: string,
    file: File,
    fields: Record<string, string> = {},
  ): IUploadRequest<TResponse> => {
    const progress = ref(0)
    const request = new XMLHttpRequest()
    let isAborted = false
    let rejectAborted: (error: UploadAbortedError) => void = () => undefined

    const send = (resolve: (response: TResponse) => void, reject: (error: IApiError) => void) => {
      request.open('POST', `${apiBaseUrl}${path}`)
      request.withCredentials = true
      request.setRequestHeader('Accept', 'application/json')
      request.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

      const xsrfToken = readXsrfToken(document.cookie)

      if (xsrfToken !== null) {
        request.setRequestHeader('X-XSRF-TOKEN', xsrfToken)
      }

      request.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          progress.value = Math.round((event.loaded / event.total) * 100)
        }
      }
      request.onload = () => {
        const body = parseBody(request.responseText)

        if (request.status >= 200 && request.status < 300) {
          progress.value = 100
          resolve(body as TResponse)
          return
        }

        reject(toApiError({ statusCode: request.status, data: body }))
      }
      request.onerror = () => reject(toApiError({ statusCode: 0, data: {} }))

      const formData = new FormData()
      formData.append('file', file)

      for (const [name, value] of Object.entries(fields)) {
        formData.append(name, value)
      }

      request.send(formData)
    }

    const promise = new Promise<TResponse>((resolve, reject) => {
      rejectAborted = reject
      request.onabort = () => reject(new UploadAbortedError())

      nuxtApp.$laravelRaom
        .ensureXsrfCookie()
        .catch(() => undefined)
        .then(() => {
          if (!isAborted) {
            send(resolve, reject)
          }
        })
    })

    const abort = (): void => {
      isAborted = true
      rejectAborted(new UploadAbortedError())
      request.abort()
    }

    return { progress, promise, abort }
  }

  return { upload }
}
