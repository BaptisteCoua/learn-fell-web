import { useDisplay } from 'vuetify'

export type ReportState = 'form' | 'sent' | 'duplicate'

/**
 * Reporting a subject (FR-027, FR-028): a reason from the list and an optional comment. A
 * second report while the first is pending is answered "already reported".
 */
export const useReportSubject = (subjectId: number) => {
  const { toApiError } = useApiError()
  const { smAndDown } = useDisplay()

  const isOpen = ref(false)
  const reason = ref<ReportReason | null>(null)
  const comment = ref('')
  const state = ref<ReportState>('form')
  const error = ref('')
  const isSending = ref(false)

  const open = (): void => {
    isOpen.value = true
    error.value = ''

    if (state.value === 'sent') {
      state.value = 'duplicate'
    }
  }

  const close = (): void => {
    isOpen.value = false
  }

  const submit = async (): Promise<void> => {
    if (!reason.value) {
      error.value = 'reason'
      return
    }

    isSending.value = true
    error.value = ''

    try {
      await Report.new({
        subject_id: subjectId,
        reason: reason.value,
        comment: comment.value.trim() || null,
      }).save()
      state.value = 'sent'
    } catch (failure) {
      const apiError = toApiError(failure)

      if (apiError.code === 'report_already_pending') {
        state.value = 'duplicate'
      } else {
        error.value = apiError.message
      }
    } finally {
      isSending.value = false
    }
  }

  return {
    isOpen,
    reason,
    comment,
    state,
    error,
    isSending,
    isSheet: smAndDown,
    open,
    close,
    submit,
  }
}
