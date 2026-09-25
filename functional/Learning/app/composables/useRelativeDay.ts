/**
 * "Aujourd'hui", "Demain", "Dans 3 jours" for a review date.
 */
export const useRelativeDay = () => {
  const { t } = useI18n()

  const relativeDay = (isoDate: string | null): string => {
    if (!isoDate) {
      return '—'
    }

    const days = daysFromToday(isoDate)

    if (days <= 0) {
      return t('today')
    }

    return days === 1 ? t('tomorrow') : t('in {count} days', { count: days })
  }

  return { relativeDay }
}
