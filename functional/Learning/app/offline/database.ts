import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { IOfflinePack, IOfflineStore, IPendingAnswer } from './types'

export const OFFLINE_DATABASE_NAME = 'cinq-offline-review'

const PACK_KEY = 'current'

interface IOfflineReviewSchema extends DBSchema {
  pack: { key: string; value: IOfflinePack }
  answers: { key: string; value: IPendingAnswer }
}

const byAnswerTime = (first: IPendingAnswer, second: IPendingAnswer): number =>
  Date.parse(first.answered_at) - Date.parse(second.answered_at)

const indexedDbStore = (database: IDBPDatabase<IOfflineReviewSchema>): IOfflineStore => {
  let persistenceAsked = false

  // Asked once, on the first write: the browser then keeps the answers through a clean-up.
  const askPersistence = (): void => {
    if (!persistenceAsked) {
      persistenceAsked = true
      void navigator.storage?.persist?.().catch(() => undefined)
    }
  }

  return {
    isPersistent: true,
    readPack: async () => (await database.get('pack', PACK_KEY)) ?? null,
    writePack: async (pack) => {
      askPersistence()
      await database.put('pack', pack, PACK_KEY)
    },
    recordAnswer: async (answer, pack) => {
      askPersistence()
      const transaction = database.transaction(['answers', 'pack'], 'readwrite')
      await Promise.all([
        transaction.objectStore('answers').put(answer),
        pack ? transaction.objectStore('pack').put(pack, PACK_KEY) : undefined,
        transaction.done,
      ])
    },
    listAnswers: async () => (await database.getAll('answers')).sort(byAnswerTime),
    removeAnswer: async (answerId) => {
      await database.delete('answers', answerId)
    },
    clear: async () => {
      database.close()
      await deleteDB(OFFLINE_DATABASE_NAME)
    },
  }
}

/**
 * Kept for the tab only, when the device cannot keep data: reviewing online works as before
 * (FR-019).
 */
export const memoryStore = (): IOfflineStore => {
  let pack: IOfflinePack | null = null
  let answers: IPendingAnswer[] = []

  return {
    isPersistent: false,
    readPack: async () => pack,
    writePack: async (newPack) => {
      pack = newPack
    },
    recordAnswer: async (answer, newPack) => {
      answers = [...answers.filter((item) => item.answer_id !== answer.answer_id), answer]
      pack = newPack ?? pack
    },
    listAnswers: async () => [...answers].sort(byAnswerTime),
    removeAnswer: async (answerId) => {
      answers = answers.filter((answer) => answer.answer_id !== answerId)
    },
    clear: async () => {
      pack = null
      answers = []
    },
  }
}

/**
 * Opens the review data of the device: IndexedDB when it can be opened, memory otherwise
 * (private browsing, quota or refusal).
 */
export const openOfflineStore = async (): Promise<IOfflineStore> => {
  try {
    const database: IDBPDatabase<IOfflineReviewSchema> = await openDB<IOfflineReviewSchema>(
      OFFLINE_DATABASE_NAME,
      1,
      {
        upgrade: (upgraded) => {
          upgraded.createObjectStore('pack')
          upgraded.createObjectStore('answers', { keyPath: 'answer_id' })
        },
        // Another tab erasing the data (logging out) must not wait for this one.
        blocking: () => database.close(),
      },
    )

    return indexedDbStore(database)
  } catch {
    return memoryStore()
  }
}
