import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RichTextEditor from '../app/components/RichTextEditor.vue'

describe('RichTextEditor', () => {
  it('offers only the formatting the API keeps, with accessible labels', async () => {
    const editor = await mountSuspended(RichTextEditor, {
      props: { modelValue: '<p>Bonjour</p>', label: 'Recto' },
    })

    expect(editor.find('[role="toolbar"]').attributes('aria-label')).toBe('Mise en forme : Recto')
    expect(
      editor.findAll('[role="toolbar"] button').map((button) => button.attributes('aria-label')),
    ).toEqual([
      'Gras',
      'Italique',
      'Liste à puces',
      'Liste numérotée',
      'Code en ligne',
      'Bloc de code',
      'Lien',
    ])
  })

  it('shows the text it is given', async () => {
    const editor = await mountSuspended(RichTextEditor, {
      props: { modelValue: '<p>Bonjour <strong>CINQ</strong></p>', label: 'Recto' },
    })
    await flushPromises()

    expect(editor.find('.tiptap').html()).toContain('<strong>CINQ</strong>')
  })
})

describe('useLinkPrompt', () => {
  it('applies the typed address, or removes the link when it is empty', () => {
    const setLink = vi.fn()
    const { open, url, apply, isOpen } = useLinkPrompt(setLink)

    open()
    url.value = 'https://git-scm.com'
    apply()
    open()
    apply()

    expect(setLink.mock.calls).toEqual([['https://git-scm.com'], ['']])
    expect(isOpen.value).toBe(false)
  })
})
