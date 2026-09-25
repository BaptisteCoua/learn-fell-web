import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import MySubjectsPage from '../app/pages/mes-sujets.vue'
import { aSubject, dialogText, signInAsAuthor, stubAuthoringApi } from './support/authoringApi'

const SUBJECTS = [
  aSubject({ id: 40, status: 'draft', questions_count: 0, title: 'Brouillon vide' }),
  aSubject({ id: 41, status: 'published', title: 'Sujet publié' }),
  aSubject({
    id: 42,
    status: 'retired',
    title: 'Sujet retiré',
    retired_reason: 'Contenu recopié.',
  }),
]

describe('MySubjectsPage', () => {
  beforeEach(() => {
    signInAsAuthor()
  })

  it('lists every subject of the account with the count of each status', async () => {
    const calls = stubAuthoringApi({ 'subjects/search': () => SUBJECTS })

    const page = await mountSuspended(MySubjectsPage, { route: '/mes-sujets' })

    expect(page.findAll('.my-subject-row')).toHaveLength(3)
    expect(page.findAll('.my-subjects-page__filter').map((filter) => filter.text())).toEqual([
      'Tous · 3',
      'Brouillons · 1',
      'Publiés · 1',
      'Retirés · 1',
    ])
    expect(page.text()).toContain('Motif de la modération : Contenu recopié.')
    expect(calls[0]?.body).toMatchObject({
      search: { filters: [{ field: 'author_id', operator: '=', value: 6 }] },
    })
  })

  it('filters by status', async () => {
    stubAuthoringApi({ 'subjects/search': () => SUBJECTS })

    const page = await mountSuspended(MySubjectsPage, { route: '/mes-sujets' })
    await page.findAll('.my-subjects-page__filter')[2]?.trigger('click')

    expect(
      page.findAll('.my-subject-row').map((row) => row.find('.my-subject-row__title').text()),
    ).toEqual(['Sujet publié'])
  })

  it('refuses to publish a subject without question before calling the API', async () => {
    const calls = stubAuthoringApi({ 'subjects/search': () => SUBJECTS })

    const page = await mountSuspended(MySubjectsPage, { route: '/mes-sujets' })
    await page
      .findAll('button')
      .find((button) => button.text() === 'Publier')
      ?.trigger('click')
    await flushPromises()

    expect(dialogText()).toContain('« Brouillon vide » ne contient aucune question.')
    expect(calls.some((call) => call.path === 'subjects/actions/publish')).toBe(false)
  })

  it('unpublishes a subject through its action', async () => {
    const calls = stubAuthoringApi({
      'subjects/search': () => SUBJECTS,
      'subjects/actions/unpublish': () => ({ data: { impacted: 1 } }),
    })

    const page = await mountSuspended(MySubjectsPage, { route: '/mes-sujets' })
    await page
      .findAll('button')
      .find((button) => button.text() === 'Dépublier')
      ?.trigger('click')
    await flushPromises()

    expect(calls.find((call) => call.path === 'subjects/actions/unpublish')?.body).toMatchObject({
      search: { filters: [{ field: 'id', operator: '=', value: 41 }] },
    })
  })

  it('invites to create a first subject when there is none', async () => {
    stubAuthoringApi({ 'subjects/search': () => [] })

    const page = await mountSuspended(MySubjectsPage, { route: '/mes-sujets' })

    expect(page.text()).toContain("Aucun sujet pour l'instant")
  })
})
