/**
 * A learned subject as kept on the device: its title and how many cards sit in each box.
 */
export interface IOfflineLearning {
  id: number
  subject_id: number
  box_1_count: number
  box_2_count: number
  box_3_count: number
  box_4_count: number
  box_5_count: number
  next_review_on: string | null
  subject: { id: number; title: string; category: { name: string } | null }
}

/**
 * A card as kept on the device, shaped like the API's so the session shows it the same way.
 * Images keep only their description: their files are never kept (FR-002).
 */
export interface IOfflineCard {
  id: number
  subject_id: number
  question_id: number
  box: number
  next_review_on: string
  subject: { id: number; title: string }
  question: {
    id: number
    recto_html: string | null
    verso_html: string
    position: number
    images: { alt: string; position: number }[]
  }
}

/**
 * Everything kept for one account: the cards due within 7 days of `updated_at` (FR-001).
 */
export interface IOfflinePack {
  user_id: number
  timezone: string
  updated_at: string
  learnings: IOfflineLearning[]
  cards: IOfflineCard[]
}

/**
 * An answer given on the device and not yet acknowledged by the API (FR-008).
 */
export interface IPendingAnswer {
  answer_id: string
  user_id: number
  card_progress_id: number
  known: boolean
  answered_at: string
  due_on: string
}

/**
 * Where the pack and the answers are kept: IndexedDB, or memory when the device refuses it.
 */
export interface IOfflineStore {
  isPersistent: boolean
  readPack: () => Promise<IOfflinePack | null>
  writePack: (pack: IOfflinePack) => Promise<void>
  // The answer and the pack it changed are written together, or not at all.
  recordAnswer: (answer: IPendingAnswer, pack: IOfflinePack | null) => Promise<void>
  listAnswers: () => Promise<IPendingAnswer[]>
  removeAnswer: (answerId: string) => Promise<void>
  clear: () => Promise<void>
}
