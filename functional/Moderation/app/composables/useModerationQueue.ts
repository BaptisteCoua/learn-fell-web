export interface IReportGroup {
  subject: Subject
  reports: Report[]
  oldestAt: string
  reasonCounts: { reason: ReportReason; count: number }[]
}

/**
 * The moderation queue (FR-030): pending reports grouped by subject, the oldest first.
 */
export const useModerationQueue = async () => {
  const nuxtApp = useNuxtApp()
  const { ignore } = useModerationActions()

  const reports = ref<Report[]>([])
  const retireTarget = ref<IReportGroup | null>(null)

  const groups = computed<IReportGroup[]>(() => {
    const bySubject = new Map<number, Report[]>()

    for (const report of reports.value) {
      bySubject.set(report.subject_id, [...(bySubject.get(report.subject_id) ?? []), report])
    }

    return [...bySubject.values()]
      .map((subjectReports) => {
        const counts = new Map<ReportReason, number>()
        subjectReports.forEach((report) =>
          counts.set(report.reason, (counts.get(report.reason) ?? 0) + 1),
        )

        return {
          subject: subjectReports[0]!.subject,
          reports: subjectReports,
          oldestAt: subjectReports[0]!.created_at,
          reasonCounts: [...counts.entries()]
            .map(([reason, count]) => ({ reason, count }))
            .sort((first, second) => second.count - first.count),
        }
      })
      .sort((first, second) => first.oldestAt.localeCompare(second.oldestAt))
  })

  const load = async (): Promise<void> => {
    const [data] = await nuxtApp.runWithContext(() =>
      Report.query()
        .where('status', 'pending')
        .include('subject')
        .include('subject.category')
        .include('subject.author')
        .include('reporter')
        .limit(100)
        .get(),
    )
    reports.value = Array.from(data)
  }

  const ignoreGroup = async (group: IReportGroup): Promise<void> => {
    if ((await ignore(group.subject.id, group.subject.title)) === 'done') {
      await load()
    }
  }

  const askToRetire = (group: IReportGroup): void => {
    retireTarget.value = group
  }

  const closeRetire = (): void => {
    retireTarget.value = null
  }

  const onRetired = async (): Promise<void> => {
    retireTarget.value = null
    await load()
  }

  await load()

  return { groups, retireTarget, ignoreGroup, askToRetire, closeRetire, onRetired }
}
