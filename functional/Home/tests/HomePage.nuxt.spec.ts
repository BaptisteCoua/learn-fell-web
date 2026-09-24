import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import HomePage from '../app/pages/index.vue'

const aSubject = (id: number, authorId: number, displayName: string) => ({
  id,
  title: `Sujet ${id}`,
  description: 'Une description.',
  status: 'published',
  questions_count: 3,
  author: { id: authorId, display_name: displayName },
  category: { id: 1, name: 'Langues' },
  tags: [],
})

describe('HomePage', () => {
  it('shows the three latest subjects, their authors and the five boxes', async () => {
    const subjects = [
      aSubject(1, 10, 'Inès Martin'),
      aSubject(2, 10, 'Inès Martin'),
      aSubject(3, 11, 'Hugo Lefèvre'),
      aSubject(4, 12, 'Nora Benali'),
    ]
    const apiFetch = vi.fn(async (url: string) => {
      if (url !== 'subjects/search') {
        throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 })
      }

      return { data: subjects, current_page: 1, last_page: 1, total: subjects.length }
    })
    Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

    const homePage = await mountSuspended(HomePage)

    expect(homePage.findAll('.subject-card')).toHaveLength(3)
    expect(homePage.text()).not.toContain('Sujet 4')
    expect(homePage.findAll('.landing__author').map((author) => author.text())).toEqual([
      'IMInès MartinLangues',
      'HLHugo LefèvreLangues',
    ])
    expect(homePage.findAll('.landing__box')).toHaveLength(5)
    expect(homePage.text()).toContain('Tous les 16 jours')
    expect(homePage.text()).toContain('Créer un compte')
  })
})
