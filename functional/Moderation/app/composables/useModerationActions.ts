export type ModerationResult = 'done' | 'reason-required' | 'failed'

/**
 * The moderation acts, each recorded as a decision (FR-031, FR-032, FR-034).
 */
export const useModerationActions = () => {
  const { t } = useI18n()
  const { notify, notifyError } = useToast()
  const { toApiError } = useApiError()

  const decide = async (
    subjectId: number,
    decision: DecisionType,
    reason: string | null = null,
  ) => {
    await ModerationDecision.new({ subject_id: subjectId, decision, reason }).save()
  }

  const ignore = async (subjectId: number, title: string): Promise<ModerationResult> => {
    try {
      await decide(subjectId, 'ignored')
      notify(t('reports ignored: “{title}” stays published.', { title }))
      return 'done'
    } catch {
      notifyError(t('something went wrong, please try again'))
      return 'failed'
    }
  }

  const retire = async (
    subjectId: number,
    title: string,
    reason: string,
  ): Promise<ModerationResult> => {
    if (reason.trim() === '') {
      return 'reason-required'
    }

    try {
      await decide(subjectId, 'retired', reason.trim())
      notify(t('“{title}” is retired. its author sees your reason.', { title }))
      return 'done'
    } catch (error) {
      if (toApiError(error).code === 'reason_required') {
        return 'reason-required'
      }

      notifyError(t('something went wrong, please try again'))
      return 'failed'
    }
  }

  const restore = async (subjectId: number, title: string): Promise<ModerationResult> => {
    try {
      await decide(subjectId, 'restored')
      notify(t('“{title}” is restored as a draft.', { title }))
      return 'done'
    } catch {
      notifyError(t('something went wrong, please try again'))
      return 'failed'
    }
  }

  return { ignore, retire, restore }
}
