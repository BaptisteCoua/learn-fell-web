import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import HomePage from '../app/pages/index.vue'

describe('HomePage', () => {
  it('greets the visitor in French', async () => {
    const homePage = await mountSuspended(HomePage)

    expect(homePage.text()).toContain('Bienvenue sur Learn Fell')
  })
})
