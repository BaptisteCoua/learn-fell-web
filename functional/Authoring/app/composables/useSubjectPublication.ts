import type { QueryBuilder } from 'laravel-raom-nuxt/runtime'

export type PublicationResult = 'done' | 'no-question' | 'failed'

/**
 * Publishing, unpublishing and deleting a subject, with their confirmations. A subject
 * without question is refused before calling the API (FR-016).
 */
export const useSubjectPublication = () => {
  const { t } = useI18n()
  const { notify, notifyError } = useToast()

  const onlyThis = (subject: Subject) => (query: QueryBuilder<Subject>) =>
    query.where('id', subject.id)

  const publish = async (subject: Subject, questionCount: number): Promise<PublicationResult> => {
    if (questionCount === 0) {
      return 'no-question'
    }

    try {
      await Subject.actions('publish', [], onlyThis(subject))
      notify(t('subject published: everyone can see it now.'))
      return 'done'
    } catch {
      notifyError(t('something went wrong, please try again'))
      return 'failed'
    }
  }

  const unpublish = async (subject: Subject): Promise<PublicationResult> => {
    try {
      await Subject.actions('unpublish', [], onlyThis(subject))
      notify(t('subject unpublished: only you can see it now.'))
      return 'done'
    } catch {
      notifyError(t('something went wrong, please try again'))
      return 'failed'
    }
  }

  const remove = async (subject: Subject): Promise<PublicationResult> => {
    try {
      await subject.delete()
      notify(t('subject deleted.'))
      return 'done'
    } catch {
      notifyError(t('something went wrong, please try again'))
      return 'failed'
    }
  }

  return { publish, unpublish, remove }
}
