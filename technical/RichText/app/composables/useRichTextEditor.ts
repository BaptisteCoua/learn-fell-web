import StarterKit from '@tiptap/starter-kit'
import { useEditor } from '@tiptap/vue-3'

export type RichTextMark =
  'bold' | 'italic' | 'code' | 'bulletList' | 'orderedList' | 'codeBlock' | 'link'

/**
 * The formatting the API keeps (research R4): bold, italic, lists, inline and block code,
 * links. Nothing else is offered, so what the author sees is what readers get.
 */
export const useRichTextEditor = (model: Ref<string>) => {
  const editor = useEditor({
    content: model.value,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] },
      }),
    ],
    onUpdate: ({ editor: updatedEditor }) => {
      model.value = updatedEditor.isEmpty ? '' : updatedEditor.getHTML()
    },
  })

  const isActive = (mark: RichTextMark): boolean => editor.value?.isActive(mark) ?? false

  const toggle = (mark: RichTextMark): void => {
    const chain = editor.value?.chain().focus()

    if (!chain) {
      return
    }

    const commands: Record<Exclude<RichTextMark, 'link'>, () => void> = {
      bold: () => chain.toggleBold().run(),
      italic: () => chain.toggleItalic().run(),
      code: () => chain.toggleCode().run(),
      bulletList: () => chain.toggleBulletList().run(),
      orderedList: () => chain.toggleOrderedList().run(),
      codeBlock: () => chain.toggleCodeBlock().run(),
    }

    if (mark !== 'link') {
      commands[mark]()
    }
  }

  const setLink = (url: string): void => {
    const chain = editor.value?.chain().focus().extendMarkRange('link')

    if (url.trim() === '') {
      chain?.unsetLink().run()
    } else {
      chain?.setLink({ href: url.trim() }).run()
    }
  }

  // The author may reset the text from outside (cancel, retry): follow it.
  watch(model, (html) => {
    if (editor.value && html !== editor.value.getHTML() && !(html === '' && editor.value.isEmpty)) {
      editor.value.commands.setContent(html, { emitUpdate: false })
    }
  })

  return { editor, isActive, toggle, setLink }
}
