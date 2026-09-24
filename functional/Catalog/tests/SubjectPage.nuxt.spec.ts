import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SubjectPage from '../app/pages/sujets/[id]/index.vue'
import { aQuestion, aSubject, stubCatalogApi } from './support/catalogApi'

const mountSubject = async () => {
  stubCatalogApi({
    subjects: () => [aSubject()],
    questions: () => [aQuestion(401, 1), aQuestion(402, 2)],
  })

  return await mountSuspended(SubjectPage, { route: '/sujets/40' })
}

const answerButtons = (page: Awaited<ReturnType<typeof mountSubject>>) =>
  page.findAll('.question-item button')

describe('SubjectPage', () => {
  it('shows the subject and reveals only the first answer', async () => {
    const page = await mountSubject()

    expect(page.find('h1').text()).toBe('Dates clés de la Révolution')
    expect(page.text()).toContain('questions · par Léa Moreau')
    expect(page.text()).toContain('Réponse 1')
    expect(page.text()).not.toContain('Réponse 2')
  })

  it('reveals one answer, then all of them', async () => {
    const page = await mountSubject()

    await answerButtons(page)[1]?.trigger('click')
    expect(page.text()).toContain('Réponse 2')
    expect(answerButtons(page)[1]?.text()).toBe('Masquer la réponse')

    const toggleAll = page.findAll('button').find((button) => button.text().includes('toutes'))
    expect(toggleAll?.text()).toBe('Masquer toutes les réponses')
    await toggleAll?.trigger('click')
    expect(page.text()).not.toContain('Réponse 1')
    expect(page.text()).not.toContain('Réponse 2')
  })

  it('invites a visitor to sign up and to log in to report', async () => {
    const page = await mountSubject()

    expect(page.text()).toContain('Apprenez ce sujet')
    expect(page.text()).toContain('Connectez-vous pour signaler ce sujet')
  })

  it('reports a subject the viewer may not see as not found', async () => {
    stubCatalogApi({ subjects: () => [], questions: () => [] })

    await expect(useSubjectPage(41)).rejects.toMatchObject({ statusCode: 404, fatal: true })
  })
})
