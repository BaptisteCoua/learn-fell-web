export interface ILandingAuthor {
  id: number
  displayName: string
  initials: string
  categoryName: string
}

/**
 * The five Leitner boxes and how often each one comes back (research.md, R6).
 */
export const LEITNER_BOXES = [
  { box: 1, interval: 'every day' },
  { box: 2, interval: 'every 2 days' },
  { box: 3, interval: 'every 4 days' },
  { box: 4, interval: 'every 8 days' },
  { box: 5, interval: 'every 16 days' },
] as const

/**
 * The landing page: the three most recently published subjects and the people who wrote them.
 */
export const useLandingPage = async () => {
  const sessionStore = useSessionStore()
  const isVisitor = computed(() => !sessionStore.isSignedIn)

  // The API pages by 10 at least; the landing only shows the first three.
  const [subjects] = await withSubjectCard(Subject.query()).limit(10).get()
  const latestSubjects = computed(() => Array.from(subjects).slice(0, 3))

  const authors = computed<ILandingAuthor[]>(() => {
    const byId = new Map<number, ILandingAuthor>()

    for (const subject of latestSubjects.value) {
      if (!byId.has(subject.author.id)) {
        byId.set(subject.author.id, {
          id: subject.author.id,
          displayName: subject.author.display_name,
          initials: initialsOf(subject.author.display_name),
          categoryName: subject.category.name,
        })
      }
    }

    return [...byId.values()]
  })

  return { latestSubjects, authors, isVisitor, leitnerBoxes: LEITNER_BOXES }
}
