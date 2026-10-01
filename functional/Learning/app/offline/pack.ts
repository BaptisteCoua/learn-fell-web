import { addDaysToDay, boxCountsOf, localDay } from '../utils/leitner'
import type { IOfflineCard, IOfflineLearning, IOfflinePack } from './types'

export const PACK_HORIZON_DAYS = 7

/**
 * A learned subject of the pack, with its cards due on a day counted as the API counts them.
 */
export interface IOfflineRevision extends IOfflineLearning {
  due_today_count: number
}

const byDueOrder = (first: IOfflineCard, second: IOfflineCard): number =>
  first.next_review_on.localeCompare(second.next_review_on) ||
  first.subject_id - second.subject_id ||
  first.question.position - second.question.position

/**
 * The cards of the pack to review on a day, the most overdue first (FR-006, FR-044).
 */
export const dueCardsOf = (
  pack: IOfflinePack,
  day: string,
  subjectIds: number[] | null = null,
): IOfflineCard[] =>
  pack.cards
    .filter((card) => card.next_review_on <= day)
    .filter((card) => subjectIds === null || subjectIds.includes(card.subject_id))
    .sort(byDueOrder)

/**
 * The learned subjects of the pack, as « Mes révisions » shows them on a day (FR-005).
 */
export const revisionsOf = (pack: IOfflinePack, day: string): IOfflineRevision[] =>
  pack.learnings.map((learning) => {
    const cards = pack.cards.filter((card) => card.subject_id === learning.subject_id)
    const nextDates = cards.map((card) => card.next_review_on).sort()

    return {
      ...learning,
      due_today_count: cards.filter((card) => card.next_review_on <= day).length,
      next_review_on: nextDates[0] ?? learning.next_review_on,
    }
  })

/**
 * The pack once a card has been answered: its box and date, and the boxes of its subject.
 */
export const withAnswer = (
  pack: IOfflinePack,
  cardId: number,
  toBox: number,
  nextReviewOn: string,
): IOfflinePack => {
  const card = pack.cards.find((item) => item.id === cardId)

  if (!card) {
    return pack
  }

  return {
    ...pack,
    cards: pack.cards.map((item) =>
      item.id === cardId ? { ...item, box: toBox, next_review_on: nextReviewOn } : item,
    ),
    learnings: pack.learnings.map((learning) =>
      learning.subject_id === card.subject_id ? movedCard(learning, card.box, toBox) : learning,
    ),
  }
}

const movedCard = (
  learning: IOfflineLearning,
  fromBox: number,
  toBox: number,
): IOfflineLearning => {
  const counts = boxCountsOf(learning)
  counts[fromBox - 1] = Math.max((counts[fromBox - 1] ?? 0) - 1, 0)
  counts[toBox - 1] = (counts[toBox - 1] ?? 0) + 1
  const [box1 = 0, box2 = 0, box3 = 0, box4 = 0, box5 = 0] = counts

  return {
    ...learning,
    box_1_count: box1,
    box_2_count: box2,
    box_3_count: box3,
    box_4_count: box4,
    box_5_count: box5,
  }
}

/**
 * Whether the pack no longer covers the day: only its cards can be reviewed (US4-5).
 */
export const isPackOutdated = (pack: IOfflinePack, day: string): boolean =>
  day > addDaysToDay(localDay(new Date(pack.updated_at), pack.timezone), PACK_HORIZON_DAYS)
