import 'fake-indexeddb/auto'
import { vi } from 'vitest'
import { openOfflineStore } from '../../app/offline/database'
import type { IOfflineReview } from '../../app/offline/offlineReview'
import type {
  IOfflineCard,
  IOfflineLearning,
  IOfflinePack,
  IPendingAnswer,
} from '../../app/offline/types'

// Vuetify's dialogs read the visual viewport, which happy-dom does not provide.
vi.stubGlobal('visualViewport', {
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  scale: 1,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
})

export interface IApiCall {
  path: string
  body: Record<string, unknown>
}

type Handler = (call: IApiCall) => unknown

const SUBJECT = {
  id: 25,
  title: 'Verbes irréguliers',
  status: 'published',
  category: { id: 1, name: 'Langues' },
}

export const aLearning = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  subject_id: 25,
  created_at: '2026-09-20T08:00:00Z',
  due_today_count: 2,
  box_1_count: 2,
  box_2_count: 1,
  box_3_count: 0,
  box_4_count: 0,
  box_5_count: 0,
  next_review_on: '2026-09-25',
  subject: SUBJECT,
  ...overrides,
})

export const aQuestionImage = (id: number, position: number, alt = `Image ${id}`) => ({
  id,
  question_id: 101,
  alt,
  position,
  width: 1600,
  height: 1067,
  variant_widths: [480, 960, 1600],
})

export const aCard = (id: number, box = 1, images: unknown[] = []) => ({
  id,
  subject_id: 25,
  question_id: 100 + id,
  box,
  next_review_on: '2026-09-25',
  last_answered_at: null,
  subject: SUBJECT,
  question: {
    id: 100 + id,
    subject_id: 25,
    recto_html: `<p>Recto ${id}</p>`,
    verso_html: `<p>Verso ${id}</p>`,
    position: id,
    images,
  },
})

/**
 * Replaces the API fetch; a search answers one page of what its handler returns.
 */
export const stubLearningApi = (handlers: Record<string, Handler>) => {
  const calls: IApiCall[] = []
  const apiFetch = vi.fn(async (rawPath: string, options: { body?: string } = {}) => {
    const path = rawPath.replace(/^\//, '')
    const call = { path, body: JSON.parse(options.body ?? '{}') }
    calls.push(call)
    const handler = handlers[path]

    if (!handler) {
      throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 })
    }

    const result = handler(call)

    return path.endsWith('/search')
      ? { data: result, current_page: 1, last_page: 1, total: (result as unknown[]).length }
      : result
  })

  Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

  return calls
}

export const aPackCard = (
  id: number,
  overrides: Partial<IOfflineCard> = {},
  images: { alt: string; position: number }[] = [],
): IOfflineCard => ({
  id,
  subject_id: 25,
  question_id: 100 + id,
  box: 1,
  next_review_on: '2026-10-05',
  subject: { id: 25, title: 'Verbes irréguliers' },
  question: {
    id: 100 + id,
    recto_html: `<p>Recto ${id}</p>`,
    verso_html: `<p>Verso ${id}</p>`,
    position: id,
    images,
  },
  ...overrides,
})

export const aPackLearning = (overrides: Partial<IOfflineLearning> = {}): IOfflineLearning => ({
  id: 1,
  subject_id: 25,
  box_1_count: 2,
  box_2_count: 1,
  box_3_count: 0,
  box_4_count: 0,
  box_5_count: 0,
  next_review_on: '2026-10-05',
  subject: { id: 25, title: 'Verbes irréguliers', category: { name: 'Langues' } },
  ...overrides,
})

export const aPack = (overrides: Partial<IOfflinePack> = {}): IOfflinePack => ({
  user_id: 7,
  timezone: 'Europe/Paris',
  updated_at: '2026-10-05T06:00:00.000Z',
  learnings: [aPackLearning()],
  cards: [aPackCard(1), aPackCard(2, { box: 2 })],
  ...overrides,
})

/**
 * Starts from a device holding this pack and these answers, or nothing.
 */
export const seedDevice = async (pack: IOfflinePack | null, answers: IPendingAnswer[] = []) => {
  await (useNuxtApp().$offlineReview as IOfflineReview).discard()
  const store = await openOfflineStore()

  if (pack) {
    await store.writePack(pack)
  }

  for (const answer of answers) {
    await store.recordAnswer(answer, null)
  }
}

export const anAnswer = (cardId: number, answeredAt: string): IPendingAnswer => ({
  answer_id: `00000000-0000-4000-8000-00000000000${cardId}`,
  user_id: 7,
  card_progress_id: cardId,
  known: true,
  answered_at: answeredAt,
  due_on: '2026-10-05',
})

let isOnline = true

Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => isOnline })

/**
 * The device loses the network: every call fails without reaching the API.
 */
export const goOffline = () => {
  isOnline = false
  Object.assign(useNuxtApp().$laravelRaom, {
    fetch: vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    }),
  })
  window.dispatchEvent(new Event('offline'))
}

/**
 * The device is opened without the network: the account cannot be asked for.
 */
export const openOffline = () => {
  goOffline()
  const sessionStore = useSessionStore()
  sessionStore.user = null
  sessionStore.isUnreachable = true
}

/**
 * The device has the network again; the app has not noticed yet.
 */
export const restoreNetwork = () => {
  isOnline = true
}

export const goOnline = () => {
  restoreNetwork()
  useSessionStore().isUnreachable = false
}

export const signIn = () => {
  // Signing in syncs the review data of the device: no call may leave the test.
  if (!vi.isMockFunction(useNuxtApp().$laravelRaom.fetch)) {
    stubLearningApi({})
  }

  useSessionStore().user = {
    id: 7,
    display_name: 'Inès Martin',
    email: 'ines@exemple.fr',
    permissions: [],
    timezone: 'Europe/Paris',
  }
}
