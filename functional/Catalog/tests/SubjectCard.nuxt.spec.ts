import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SubjectCard from '../app/components/SubjectCard.vue'
import { aSubject } from './support/catalogApi'

describe('SubjectCard', () => {
  it('shows the subject with its category, author, question count and tags', async () => {
    const card = await mountSuspended(SubjectCard, { props: { subject: aSubject() } })

    expect(card.attributes('href')).toBe('/sujets/40')
    expect(card.text()).toContain('Dates clés de la Révolution')
    expect(card.text()).toContain('Histoire · 2 questions')
    expect(card.text()).toContain('par Léa Moreau')
    expect(card.text()).toContain('révolution')
  })

  it('marks the searched words', async () => {
    const card = await mountSuspended(SubjectCard, {
      props: { subject: aSubject(), query: 'revolution' },
    })

    expect(card.findAll('mark').map((mark) => mark.text())).toEqual(['Révolution', 'révolution'])
  })

  it('cycles through the three card colours', async () => {
    const card = await mountSuspended(SubjectCard, { props: { subject: aSubject(), index: 4 } })

    expect(card.classes()).toContain('subject-card--white')
  })
})
