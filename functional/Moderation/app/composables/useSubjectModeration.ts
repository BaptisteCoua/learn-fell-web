/**
 * The administrator's view of one subject: retire it with a reason, or restore it.
 */
export const useSubjectModeration = (
  subjectId: number,
  title: string,
  status: SubjectStatus,
  onStatusChange: (status: SubjectStatus) => void = () => undefined,
) => {
  const { restore } = useModerationActions()

  const currentStatus = ref<SubjectStatus>(status)
  const isRetireOpen = ref(false)
  const isRestoreOpen = ref(false)

  const openRetire = (): void => {
    isRetireOpen.value = true
  }

  const closeRetire = (): void => {
    isRetireOpen.value = false
  }

  const openRestore = (): void => {
    isRestoreOpen.value = true
  }

  const closeRestore = (): void => {
    isRestoreOpen.value = false
  }

  const onRetired = (): void => {
    isRetireOpen.value = false
    currentStatus.value = 'retired'
    onStatusChange('retired')
  }

  const confirmRestore = async (): Promise<void> => {
    isRestoreOpen.value = false

    if ((await restore(subjectId, title)) === 'done') {
      currentStatus.value = 'draft'
      onStatusChange('draft')
    }
  }

  return {
    currentStatus,
    isRetireOpen,
    isRestoreOpen,
    openRetire,
    closeRetire,
    openRestore,
    closeRestore,
    onRetired,
    confirmRestore,
  }
}
