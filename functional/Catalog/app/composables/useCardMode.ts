/**
 * Card mode of a subject: its questions one at a time, recto first.
 */
export const useCardMode = async (subjectId: number) => {
  const { subject, questions } = await useSubjectPage(subjectId)
  const deck = useCardDeck(questions)

  const progressStyle = computed(() => ({ width: `${deck.progress.value}%` }))

  return { subject, progressStyle, ...deck }
}
