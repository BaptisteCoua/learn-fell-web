import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SearchPage from '../app/pages/recherche.vue'
import { aSubject, CATEGORY, stubCatalogApi, type ISearchBody } from './support/catalogApi'

const searchedText = (body: ISearchBody) =>
  body.search.instructions?.find((instruction) => instruction.name === 'search')?.fields[0]?.value

describe('SearchPage', () => {
  it('lists the published subjects matching the search', async () => {
    const apiFetch = stubCatalogApi({
      categories: () => [CATEGORY],
      subjects: (body) => (searchedText(body) === 'révolution' ? [aSubject()] : []),
    })

    const page = await mountSuspended(SearchPage, { route: '/recherche?q=révolution' })

    expect(page.text()).toContain('1 sujet')
    expect(page.text()).toContain('pour « révolution », toutes catégories')
    expect(page.text()).toContain('Dates clés de la Révolution')
    const subjectSearch = apiFetch.mock.calls.find(([url]) => url === 'subjects/search')
    expect(JSON.parse(subjectSearch?.[1]?.body ?? '{}').search.filters).toContainEqual({
      field: 'status',
      operator: '=',
      value: 'published',
    })
  })

  it('offers the categories when nothing matches', async () => {
    stubCatalogApi({ categories: () => [CATEGORY], subjects: () => [] })

    const page = await mountSuspended(SearchPage, { route: '/recherche?q=xylophone' })

    expect(page.text()).toContain('Aucun résultat')
    expect(page.text()).toContain('Aucun sujet publié ne correspond à « xylophone »')
    expect(page.find('a[href="/categories/3"]').exists()).toBe(true)
  })

  it('asks for two characters before searching', async () => {
    const apiFetch = stubCatalogApi({ categories: () => [CATEGORY], subjects: () => [aSubject()] })

    const page = await mountSuspended(SearchPage, { route: '/recherche?q=r' })

    expect(page.text()).toContain('Saisissez au moins 2 caractères pour lancer la recherche.')
    expect(apiFetch.mock.calls.some(([url]) => url === 'subjects/search')).toBe(false)
  })
})
