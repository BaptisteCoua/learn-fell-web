import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import InstallPrompt from '../app/components/InstallPrompt.vue'
import UpdatePrompt from '../app/components/UpdatePrompt.vue'

vi.stubGlobal('visualViewport', {
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  scale: 1,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
})

// The plugin's own `$pwa` (a reactive object): set its state and spy on its methods.
const fakePwa = (state: Record<string, boolean> = {}) => {
  const pwa = useNuxtApp().$pwa as unknown as Record<string, unknown>
  Object.assign(pwa, {
    isPWAInstalled: false,
    showInstallPrompt: false,
    needRefresh: false,
    install: vi.fn(async () => ({ outcome: 'accepted', platform: 'web' })),
    cancelInstall: vi.fn(),
    updateServiceWorker: vi.fn(async () => undefined),
    cancelPrompt: vi.fn(async () => undefined),
    ...state,
  })

  return pwa as Record<string, ReturnType<typeof vi.fn>>
}

const bodyButton = (text: string) =>
  [...document.body.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
    button.textContent?.includes(text),
  )

describe('UpdatePrompt', () => {
  it('stays hidden until a new version is ready', async () => {
    fakePwa()

    const prompt = await mountSuspended(UpdatePrompt)

    expect(prompt.text()).toBe('')
  })

  it('updates now or later', async () => {
    const pwa = fakePwa({ needRefresh: true })

    const prompt = await mountSuspended(UpdatePrompt)
    expect(prompt.text()).toContain('Une nouvelle version de CINQ est disponible.')

    await prompt
      .findAll('button')
      .find((button) => button.text() === 'Mettre à jour')
      ?.trigger('click')
    await prompt
      .findAll('button')
      .find((button) => button.text() === 'Plus tard')
      ?.trigger('click')

    expect(pwa.updateServiceWorker).toHaveBeenCalledWith(true)
    expect(pwa.cancelPrompt).toHaveBeenCalled()
  })
})

describe('InstallPrompt', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('offers to install when the browser allows it, and remembers "later"', async () => {
    const pwa = fakePwa({ showInstallPrompt: true })

    await mountSuspended(InstallPrompt, { attachTo: document.body })
    await flushPromises()

    expect(document.body.textContent).toContain('Installer CINQ')
    bodyButton('Plus tard')?.click()
    await flushPromises()

    expect(pwa.cancelInstall).toHaveBeenCalled()
  })

  it('hands over to the browser install prompt', async () => {
    const pwa = fakePwa({ showInstallPrompt: true })

    await mountSuspended(InstallPrompt, { attachTo: document.body })
    await flushPromises()
    bodyButton('Installer')?.click()
    await flushPromises()

    expect(pwa.install).toHaveBeenCalled()
  })
})
