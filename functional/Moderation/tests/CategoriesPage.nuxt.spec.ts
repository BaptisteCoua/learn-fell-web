import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoriesPage from '../app/pages/admin/categories.vue'

vi.stubGlobal('visualViewport', {
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  scale: 1,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
})

interface IApiCall {
  path: string
  method: string
  body: Record<string, unknown>
}

const CATEGORIES = [
  { id: 1, name: 'Langues', position: 1, subjects_count: 3 },
  { id: 2, name: 'Histoire', position: 2, subjects_count: 0 },
]

const stubApi = (mutate: (call: IApiCall) => unknown = () => ({ created: [3], updated: [] })) => {
  const calls: IApiCall[] = []
  const apiFetch = vi.fn(
    async (rawPath: string, options: { method?: string; body?: string } = {}) => {
      const path = rawPath.replace(/^\//, '')
      const call = { path, method: options.method ?? 'GET', body: JSON.parse(options.body ?? '{}') }
      calls.push(call)

      if (path === 'categories/search') {
        return { data: CATEGORIES, current_page: 1, last_page: 1, total: 2 }
      }
      if (path === 'categories/mutate') {
        return mutate(call)
      }
      if (path === 'categories/actions/reorder') {
        return { data: { impacted: 0 } }
      }
      throw Object.assign(new Error('Unauthenticated'), { statusCode: 401 })
    },
  )
  Object.assign(useNuxtApp().$laravelRaom, { fetch: apiFetch })

  return calls
}

const dialogText = (): string => document.body.querySelector('.confirm-dialog')?.textContent ?? ''
const byLabel = (page: Awaited<ReturnType<typeof mountSuspended>>, label: string) =>
  page
    .findAll('button')
    .find((button) => button.attributes('aria-label') === label || button.text() === label)

describe('CategoriesPage', () => {
  beforeEach(() => {
    useSessionStore().user = {
      id: 1,
      display_name: 'Alex Durand',
      email: 'alex@cinq.app',
      permissions: ['categories.manage'],
    }
  })

  it('lists the categories in order with their subject count', async () => {
    stubApi()

    const page = await mountSuspended(CategoriesPage, { route: '/admin/categories' })

    expect(page.findAll('.category-admin-row__name').map((name) => name.text())).toEqual([
      'Langues',
      'Histoire',
    ])
    expect(page.findAll('.category-admin-row__count strong').map((count) => count.text())).toEqual([
      '3',
      '0',
    ])
  })

  it('adds a category and shows a taken name under the field', async () => {
    const calls = stubApi(() => {
      throw Object.assign(new Error('taken'), {
        statusCode: 422,
        data: { code: 'category_name_taken', message: 'Une catégorie « langues » existe déjà.' },
      })
    })

    const page = await mountSuspended(CategoriesPage, { route: '/admin/categories' })
    await page.find('.categories-admin__new input').setValue('langues')
    await page.find('.categories-admin__new').trigger('submit')
    await flushPromises()

    expect(calls.find((call) => call.path === 'categories/mutate')?.body).toEqual({
      mutate: [{ operation: 'create', attributes: { name: 'langues' } }],
    })
    expect(page.text()).toContain('Une catégorie « langues » existe déjà.')
  })

  it('refuses to delete a category holding subjects, without calling the API', async () => {
    const calls = stubApi()

    const page = await mountSuspended(CategoriesPage, { route: '/admin/categories' })
    await byLabel(page, 'Supprimer Langues')?.trigger('click')
    await flushPromises()

    expect(dialogText()).toContain('« Langues » contient 3 sujets, tous statuts confondus.')
    expect(calls.some((call) => call.method === 'DELETE')).toBe(false)
  })

  it('moves a category and sends the new order', async () => {
    const calls = stubApi()

    const page = await mountSuspended(CategoriesPage, { route: '/admin/categories' })
    await byLabel(page, 'Monter Histoire')?.trigger('click')
    await flushPromises()

    expect(calls.find((call) => call.path === 'categories/actions/reorder')?.body).toEqual({
      fields: [{ name: 'ids', value: [2, 1] }],
    })
  })
})
