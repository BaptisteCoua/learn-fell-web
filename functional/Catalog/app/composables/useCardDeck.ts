/**
 * Card mode: one question at a time, flip to see the answer, previous and next.
 */
export const useCardDeck = <TCard>(cards: Ref<TCard[]>) => {
  const index = ref(0)
  const isFlipped = ref(false)

  const current = computed(() => cards.value[index.value])
  const position = computed(() => `${index.value + 1} / ${cards.value.length}`)
  const progress = computed(() =>
    cards.value.length === 0 ? 0 : Math.round(((index.value + 1) / cards.value.length) * 100),
  )

  const flip = (): void => {
    isFlipped.value = !isFlipped.value
  }

  const move = (step: number): void => {
    const count = cards.value.length
    index.value = count === 0 ? 0 : (index.value + step + count) % count
    isFlipped.value = false
  }

  return {
    current,
    position,
    progress,
    isFlipped,
    flip,
    next: () => move(1),
    previous: () => move(-1),
  }
}
