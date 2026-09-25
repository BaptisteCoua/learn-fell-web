import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import SubjectEditorPage from '../app/pages/sujets/[id]/modifier.vue'
import {
  aQuestion,
  aSubject,
  CATEGORY,
  dialogText,
  signInAsAuthor,
  stubAuthoringApi,
} from './support/authoringApi'

const mountEditor = async (
  subject = aSubject(),
  questions = [aQuestion(401, 1), aQuestion(402, 2)],
) => {
  const calls = stubAuthoringApi({
    'subjects/search': () => [subject],
    'questions/search': () => questions,
    'categories/search': () => [CATEGORY],
    'questions/actions/reorder': () => ({ data: { impacted: 0 } }),
  })
  const page = await mountSuspended(SubjectEditorPage, { route: `/sujets/${subject.id}/modifier` })

  return { page, calls }
}

const buttonNamed = (page: Awaited<ReturnType<typeof mountEditor>>['page'], label: string) =>
  page
    .findAll('button')
    .find((button) => button.attributes('aria-label') === label || button.text() === label)

describe('SubjectEditor', () => {
  beforeEach(() => {
    signInAsAuthor()
  })

  it('shows the subject fields and its questions', async () => {
    const { page } = await mountEditor()

    expect(page.find('input').element.value).toBe('Git : les commandes essentielles')
    expect(page.findAll('.question-card')).toHaveLength(2)
    expect(page.text()).toContain('Questions · 2')
  })

  it('moves a question and sends the new order', async () => {
    const { page, calls } = await mountEditor()

    await buttonNamed(page, 'Monter la question 02')?.trigger('click')
    await flushPromises()

    expect(calls.find((call) => call.path === 'questions/actions/reorder')?.body).toEqual({
      fields: [
        { name: 'subject_id', value: 40 },
        { name: 'ids', value: [402, 401] },
      ],
    })
  })

  it('keeps the last question of a published subject', async () => {
    const { page, calls } = await mountEditor(aSubject({ status: 'published' }), [
      aQuestion(401, 1),
    ])

    await buttonNamed(page, 'Supprimer la question 01')?.trigger('click')
    await flushPromises()

    expect(dialogText()).toContain('Un sujet publié doit garder au moins une question.')
    expect(calls.some((call) => call.method === 'DELETE')).toBe(false)
  })

  it('asks for a recto and a verso before saving a new question', async () => {
    const { page, calls } = await mountEditor()

    await buttonNamed(page, 'Ajouter une question')?.trigger('click')
    await buttonNamed(page, 'Enregistrer la question')?.trigger('click')
    await flushPromises()

    expect(page.text()).toContain('Le recto et le verso sont obligatoires.')
    expect(calls.some((call) => call.path === 'questions/mutate')).toBe(false)
  })

  it('shows a retired subject read-only with its reason', async () => {
    const { page } = await mountEditor(
      aSubject({ status: 'retired', retired_reason: 'Contenu recopié.' }),
    )

    expect(page.text()).toContain('Sujet retiré par la modération.')
    expect(page.text()).toContain('Motif : « Contenu recopié. ».')
    expect(buttonNamed(page, 'Ajouter une question')).toBeUndefined()
    expect(buttonNamed(page, 'Modifier la question 01')).toBeUndefined()
  })

  it("reports someone else's subject as not found", async () => {
    stubAuthoringApi({
      'subjects/search': () => [aSubject({ author_id: 99 })],
      'questions/search': () => [],
      'categories/search': () => [CATEGORY],
    })

    let failure: unknown = null
    const Probe = defineComponent({
      async setup() {
        failure = await useSubjectEditor(40).then(
          () => null,
          (error: unknown) => error,
        )
        return () => h('div')
      },
    })

    await mountSuspended(Probe)

    expect(failure).toMatchObject({ statusCode: 404 })
  })
})
