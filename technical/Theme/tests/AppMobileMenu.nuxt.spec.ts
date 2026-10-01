import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AppMobileMenu from '../app/components/AppMobileMenu.vue'

vi.stubGlobal('visualViewport', {
  width: 375,
  height: 812,
  offsetLeft: 0,
  offsetTop: 0,
  scale: 1,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
})

const tiles = () => [...document.body.querySelectorAll<HTMLAnchorElement>('.app-mobile-menu__tile')]

const signIn = (permissions: string[] = []) => {
  useSessionStore().user = {
    id: 7,
    display_name: 'Inès Martin',
    email: 'ines@exemple.fr',
    permissions,
  }
}

const openMenu = async () => {
  const menu = await mountSuspended(AppMobileMenu, { route: '/revisions', attachTo: document.body })
  await menu.find('.app-mobile-menu__toggle').trigger('click')
  await flushPromises()

  return menu
}

describe('AppMobileMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps the sections folded behind a bar naming the current one', async () => {
    signIn()

    const menu = await mountSuspended(AppMobileMenu, {
      route: '/categories',
      attachTo: document.body,
    })
    await flushPromises()
    const toggle = menu.find('.app-mobile-menu__toggle')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.text()).toBe('Catalogue')
    expect(toggle.attributes('aria-label')).toBe('Menu, page actuelle : Catalogue')
    expect(toggle.classes()).toContain('app-mobile-menu__toggle--blue')
    expect(tiles()).toHaveLength(0)
  })

  it('falls back to the menu label outside the sections', async () => {
    signIn()

    const menu = await mountSuspended(AppMobileMenu, { route: '/', attachTo: document.body })
    const toggle = menu.find('.app-mobile-menu__toggle')

    expect(toggle.text()).toBe('Menu')
    expect(toggle.attributes('aria-label')).toBeUndefined()
    expect(toggle.classes()).toContain('app-mobile-menu__toggle--ink')
  })

  it('opens four tiles and marks the current page', async () => {
    signIn()

    const menu = await openMenu()

    expect(menu.find('.app-mobile-menu__toggle').attributes('aria-expanded')).toBe('true')
    expect(tiles().map((tile) => [tile.textContent?.trim(), tile.getAttribute('href')])).toEqual([
      ['Réviser', '/revisions'],
      ['Catalogue', '/categories'],
      ['Sujets', '/mes-sujets'],
      ['Créer', '/sujets/nouveau'],
    ])
    expect(tiles()[0]?.getAttribute('aria-current')).toBe('page')
    expect(tiles()[1]?.getAttribute('aria-current')).toBeNull()
  })

  it('adds the moderation tile for a moderator', async () => {
    signIn(['subjects.moderate'])

    await openMenu()

    expect(tiles().at(-1)?.getAttribute('href')).toBe('/admin/moderation')
  })

  it('closes once a tile is chosen', async () => {
    signIn()

    const menu = await openMenu()
    tiles()[0]?.click()
    await flushPromises()

    expect(menu.find('.app-mobile-menu__toggle').attributes('aria-expanded')).toBe('false')
  })
})
