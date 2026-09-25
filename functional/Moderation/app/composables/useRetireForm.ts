/**
 * The retire dialog: the reason is required and shown to the author (FR-031).
 */
export const useRetireForm = (onRetired: () => void) => {
  const { retire } = useModerationActions()

  const reason = ref('')
  const isReasonMissing = ref(false)
  const isSending = ref(false)

  const reset = (): void => {
    reason.value = ''
    isReasonMissing.value = false
  }

  const submit = async (subjectId: number, title: string): Promise<void> => {
    isSending.value = true
    const result = await retire(subjectId, title, reason.value)
    isSending.value = false
    isReasonMissing.value = result === 'reason-required'

    if (result === 'done') {
      reset()
      onRetired()
    }
  }

  return { reason, isReasonMissing, isSending, reset, submit }
}
