/**
 * Which answers are shown on the subject page; the first one starts revealed.
 */
export const useQuestionReveal = (questionIds: Ref<number[]>) => {
  const revealedIds = ref<Set<number>>(new Set(questionIds.value.slice(0, 1)))

  const isRevealed = (questionId: number): boolean => revealedIds.value.has(questionId)
  const areAllRevealed = computed(
    () =>
      questionIds.value.length > 0 && questionIds.value.every((id) => revealedIds.value.has(id)),
  )

  const toggle = (questionId: number): void => {
    const next = new Set(revealedIds.value)

    if (next.has(questionId)) {
      next.delete(questionId)
    } else {
      next.add(questionId)
    }

    revealedIds.value = next
  }

  const toggleAll = (): void => {
    revealedIds.value = areAllRevealed.value ? new Set() : new Set(questionIds.value)
  }

  return { isRevealed, areAllRevealed, toggle, toggleAll }
}
