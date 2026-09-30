import { ref, type Ref } from 'vue'

export interface IFakeUpload {
  path: string
  file: File
  progress: Ref<number>
  promise: Promise<unknown>
  abort: () => void
  isAborted: boolean
  succeed: (image: Record<string, unknown>) => void
  fail: (error: Record<string, unknown>) => void
}

export const uploadedImage = (id: number) => ({
  id,
  width: 1600,
  height: 1067,
  variant_widths: [480, 960, 1600],
})

/**
 * Stands in for `useUploadRequest`: each upload waits for the test to play its progress and
 * its answer. Declared with `mockNuxtImport('useUploadRequest', () => fakeUploadRequest)`.
 */
export const fakeUploads: IFakeUpload[] = []

export const fakeUploadRequest = () => ({
  upload: (path: string, file: File) => {
    let resolve: (value: unknown) => void = () => undefined
    let reject: (error: unknown) => void = () => undefined
    const promise = new Promise((resolvePromise, rejectPromise) => {
      resolve = resolvePromise
      reject = rejectPromise
    })
    const fakeUpload: IFakeUpload = {
      path,
      file,
      progress: ref(0),
      promise,
      isAborted: false,
      abort: () => {
        fakeUpload.isAborted = true
        reject(new UploadAbortedError())
      },
      succeed: (image) => resolve({ data: image }),
      fail: (error) => reject(error),
    }
    fakeUploads.push(fakeUpload)

    return fakeUpload
  },
})

export const resetFakeUploads = () => {
  fakeUploads.splice(0, fakeUploads.length)
}

export const aFile = (name: string, type: string, size = 2 * 1024 * 1024): File => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}
