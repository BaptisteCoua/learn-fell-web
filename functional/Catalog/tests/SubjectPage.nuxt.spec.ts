import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CardModePage from '../app/pages/sujets/[id]/cartes.vue'
import SubjectPage from '../app/pages/sujets/[id]/index.vue'
import { aQuestion, aQuestionImage, aSubject, stubCatalogApi } from './support/catalogApi'

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

  it('asks for the images of the questions', async () => {
    const apiFetch = stubCatalogApi({
      subjects: () => [aSubject()],
      questions: () => [aQuestion(401, 1)],
    })

    await mountSuspended(SubjectPage, { route: '/sujets/40' })

    const questionSearch = apiFetch.mock.calls.find(([url]) => url === 'questions/search')
    expect(JSON.parse(questionSearch?.[1]?.body ?? '{}').search.includes).toEqual([
      { relation: 'images' },
    ])
  })

  it('shows the images of a recto above its text, in their order', async () => {
    stubCatalogApi({
      subjects: () => [aSubject()],
      questions: () => [
        aQuestion(401, 1, {
          images: [aQuestionImage(2, 1, 'Hibou en vol'), aQuestionImage(1, 0, 'Hibou de face')],
        }),
      ],
    })

    const page = await mountSuspended(SubjectPage, { route: '/sujets/40' })
    const recto = page.find('.question-item__recto')

    expect(recto.findAll('img').map((image) => image.attributes('alt'))).toEqual([
      'Hibou de face',
      'Hibou en vol',
    ])
    expect(recto.html().indexOf('question-image-gallery')).toBeLessThan(
      recto.html().indexOf('Question 1'),
    )
  })

  it('shows an image-only recto without an empty text', async () => {
    stubCatalogApi({
      subjects: () => [aSubject()],
      questions: () => [aQuestion(401, 1, { recto_html: '', images: [aQuestionImage(1, 0)] })],
    })

    const page = await mountSuspended(SubjectPage, { route: '/sujets/40' })

    expect(page.find('.question-item__question').exists()).toBe(false)
    expect(page.find('.question-item img').exists()).toBe(true)
  })

  it('shows a question without image as before', async () => {
    const page = await mountSubject()

    expect(page.find('.question-item img').exists()).toBe(false)
    expect(page.find('.question-image-gallery').exists()).toBe(false)
    expect(page.find('.question-item__question').text()).toBe('Question 1')
  })

  it('shows the images on the recto face in card mode', async () => {
    stubCatalogApi({
      subjects: () => [aSubject()],
      questions: () => [aQuestion(401, 1, { images: [aQuestionImage(1, 0, 'Hibou de face')] })],
    })

    const page = await mountSuspended(CardModePage, { route: '/sujets/40/cartes' })
    const recto = page.find('.card-mode__card')

    expect(recto.find('img').attributes('alt')).toBe('Hibou de face')

    const flip = page.findAll('button').find((button) => button.text() === 'Retourner la carte')
    await flip?.trigger('click')

    expect(page.find('.card-mode__card--verso img').attributes('alt')).toBe('Hibou de face')
  })

  it('reports a subject the viewer may not see as not found', async () => {
    stubCatalogApi({ subjects: () => [], questions: () => [] })

    await expect(useSubjectPage(41)).rejects.toMatchObject({ statusCode: 404, fatal: true })
  })
})
