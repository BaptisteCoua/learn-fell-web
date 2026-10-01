import type { IOfflineCard, IOfflineLearning, IOfflinePack } from './types'

interface IPageMeta {
  last_page?: number
}

const allPages = async <T>(
  readPage: (page: number) => Promise<[Iterable<T>, IPageMeta]>,
): Promise<T[]> => {
  const items: T[] = []

  for (let page = 1; ; page += 1) {
    const [data, meta] = await readPage(page)
    items.push(...Array.from(data))

    if (page >= (meta.last_page ?? 1)) {
      return items
    }
  }
}

const toOfflineLearning = (learning: Learning): IOfflineLearning => ({
  id: learning.id,
  subject_id: learning.subject_id,
  box_1_count: learning.box_1_count ?? 0,
  box_2_count: learning.box_2_count ?? 0,
  box_3_count: learning.box_3_count ?? 0,
  box_4_count: learning.box_4_count ?? 0,
  box_5_count: learning.box_5_count ?? 0,
  next_review_on: learning.next_review_on,
  subject: {
    id: learning.subject.id,
    title: learning.subject.title,
    category: learning.subject.category ? { name: learning.subject.category.name } : null,
  },
})

const toOfflineCard = (card: CardProgress): IOfflineCard => ({
  id: card.id,
  subject_id: card.subject_id,
  question_id: card.question_id,
  box: card.box,
  next_review_on: card.next_review_on.slice(0, 10),
  subject: { id: card.subject.id, title: card.subject.title },
  question: {
    id: card.question.id,
    recto_html: card.question.recto_html,
    verso_html: card.question.verso_html,
    position: card.question.position,
    // Only the description of each image: no file is kept (FR-002).
    images: Array.from(card.question.images ?? []).map((image) => ({
      alt: image.alt,
      position: image.position,
    })),
  },
})

/**
 * Reads what the device keeps for the account: its learned subjects and the cards due within
 * 7 days (instruction `upcoming`, FR-001).
 */
export const fetchPackContent = async (): Promise<Pick<IOfflinePack, 'learnings' | 'cards'>> => {
  const [learnings, cards] = await Promise.all([
    allPages((page) =>
      Learning.query().include('subject').include('subject.category').limit(50).page(page).get(),
    ),
    allPages((page) =>
      CardProgress.query()
        .instruction('upcoming', [])
        .include('question')
        .include('question.images')
        .include('subject')
        .limit(100)
        .page(page)
        .get(),
    ),
  ])

  return { learnings: learnings.map(toOfflineLearning), cards: cards.map(toOfflineCard) }
}
