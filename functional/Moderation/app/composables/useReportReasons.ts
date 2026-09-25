/**
 * The closed list of report reasons (FR-027), with their French labels.
 */
export const useReportReasons = () => {
  const { t } = useI18n()

  const reasons = computed<{ value: ReportReason; label: string }[]>(() => [
    { value: 'inappropriate', label: t('inappropriate content') },
    { value: 'incorrect', label: t('incorrect content') },
    { value: 'spam', label: t('spam') },
    { value: 'copyright', label: t('copyright') },
    { value: 'other', label: t('other') },
  ])

  const labelOf = (reason: ReportReason): string =>
    reasons.value.find((item) => item.value === reason)?.label ?? reason

  return { reasons, labelOf }
}
