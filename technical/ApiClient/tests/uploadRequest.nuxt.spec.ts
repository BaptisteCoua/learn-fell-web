import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

const API_ORIGIN = 'http://localhost:8090'
const EXPIRED_XSRF_COOKIE = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'

/**
 * Stands in for the browser's XMLHttpRequest: records what is sent, and lets the test play the
 * upload progress and the answer of the API.
 */
class FakeXhr {
  static sent: FakeXhr[] = []

  method = ''
  url = ''
  withCredentials = false
  headers: Record<string, string> = {}
  body: FormData | null = null
  status = 0
  responseText = ''
  upload: {
    onprogress:
      ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null
  } = { onprogress: null }

  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null

  open(method: string, url: string): void {
    this.method = method
    this.url = url
  }

  setRequestHeader(name: string, value: string): void {
    this.headers[name] = value
  }

  send(body: FormData): void {
    this.body = body
    FakeXhr.sent.push(this)
  }

  abort(): void {
    this.onabort?.()
  }

  respond(status: number, body: unknown): void {
    this.status = status
    this.responseText = JSON.stringify(body)
    this.onload?.()
  }
}

/** The composable reads the translations, which only a component setup provides. */
const mountUploader = async (): Promise<ReturnType<typeof useUploadRequest>> => {
  let uploader: ReturnType<typeof useUploadRequest> | null = null
  await mountSuspended(
    defineComponent({
      setup() {
        uploader = useUploadRequest()
        return () => h('div')
      },
    }),
  )

  return uploader!
}

const aFile = () => new File(['pixels'], 'hibou.jpg', { type: 'image/jpeg' })

const lastRequest = async (): Promise<FakeXhr> => {
  await vi.waitFor(() => expect(FakeXhr.sent).toHaveLength(1))
  return FakeXhr.sent[0] as FakeXhr
}

describe('useUploadRequest', () => {
  let unregisterCsrfCookie: () => void = () => undefined
  let csrfCookieCalls = 0

  beforeEach(() => {
    FakeXhr.sent = []
    csrfCookieCalls = 0
    vi.stubGlobal('XMLHttpRequest', FakeXhr)
    unregisterCsrfCookie = registerEndpoint(`${API_ORIGIN}/sanctum/csrf-cookie`, () => {
      csrfCookieCalls += 1
      document.cookie = 'XSRF-TOKEN=fresh; path=/'
      return new Response(null, { status: 204 })
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    unregisterCsrfCookie()
    document.cookie = EXPIRED_XSRF_COOKIE
  })

  it('sends the file with the session cookie and the XSRF header', async () => {
    document.cookie = 'XSRF-TOKEN=held; path=/'
    const file = aFile()

    const { promise } = (await mountUploader()).upload('/question-images', file)
    const request = await lastRequest()
    request.respond(201, { data: { id: 812 } })

    await expect(promise).resolves.toEqual({ data: { id: 812 } })
    expect(request.method).toBe('POST')
    expect(request.url).toBe(`${API_ORIGIN}/api/question-images`)
    expect(request.withCredentials).toBe(true)
    expect(request.headers['X-XSRF-TOKEN']).toBe('held')
    expect(request.headers.Accept).toBe('application/json')
    expect(request.body?.get('file')).toBe(file)
    expect(csrfCookieCalls).toBe(0)
  })

  it('asks for an XSRF cookie first when the browser has none', async () => {
    ;(await mountUploader()).upload('/question-images', aFile())
    const request = await lastRequest()

    expect(csrfCookieCalls).toBe(1)
    expect(request.headers['X-XSRF-TOKEN']).toBe('fresh')
  })

  it('reports the progress of the upload in percent', async () => {
    document.cookie = 'XSRF-TOKEN=held; path=/'

    const { progress } = (await mountUploader()).upload('/question-images', aFile())
    const request = await lastRequest()
    request.upload.onprogress?.({ lengthComputable: true, loaded: 512, total: 2048 })

    expect(progress.value).toBe(25)
  })

  it('rejects with the validation message of the file', async () => {
    document.cookie = 'XSRF-TOKEN=held; path=/'

    const { promise } = (await mountUploader()).upload('/question-images', aFile())
    const request = await lastRequest()
    request.respond(422, {
      message: "L'image ne doit pas dépasser 5 Mo.",
      errors: { file: ["L'image ne doit pas dépasser 5 Mo."] },
    })

    await expect(promise).rejects.toEqual({
      status: 422,
      code: null,
      message: "L'image ne doit pas dépasser 5 Mo.",
      fieldErrors: { file: "L'image ne doit pas dépasser 5 Mo." },
    })
  })

  it('rejects with a generic message when the network fails', async () => {
    document.cookie = 'XSRF-TOKEN=held; path=/'

    const { promise } = (await mountUploader()).upload('/question-images', aFile())
    const request = await lastRequest()
    request.onerror?.()

    await expect(promise).rejects.toMatchObject({
      status: 0,
      message: 'Une erreur est survenue, veuillez réessayer',
    })
  })

  it('rejects apart when the upload is cancelled', async () => {
    document.cookie = 'XSRF-TOKEN=held; path=/'

    const { promise, abort } = (await mountUploader()).upload('/question-images', aFile())
    await lastRequest()
    abort()

    await expect(promise).rejects.toBeInstanceOf(UploadAbortedError)
  })

  it('sends nothing when cancelled before it started', async () => {
    const { promise, abort } = (await mountUploader()).upload('/question-images', aFile())
    abort()

    await expect(promise).rejects.toBeInstanceOf(UploadAbortedError)
    expect(FakeXhr.sent).toHaveLength(0)
  })
})
