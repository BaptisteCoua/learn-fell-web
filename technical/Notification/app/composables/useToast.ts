import { toast } from 'vue3-toastify'

/**
 * Shows a short confirmation, or a failure the user can act on.
 */
export const useToast = () => {
  const notify = (message: string): void => {
    toast.success(message)
  }

  const notifyError = (message: string): void => {
    toast.error(message)
  }

  return { notify, notifyError }
}
