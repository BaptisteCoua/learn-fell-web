<template>
  <div :class="['rich-text-editor', { 'rich-text-editor--invalid': invalid }]">
    <div
      role="toolbar"
      :aria-label="$t('formatting of {label}', { label })"
      class="rich-text-editor__toolbar"
    >
      <button
        v-for="tool in tools"
        :key="tool.mark"
        type="button"
        :aria-label="tool.label"
        :aria-pressed="isActive(tool.mark)"
        :title="tool.label"
        :class="[
          'rich-text-editor__tool',
          { 'rich-text-editor__tool--active': isActive(tool.mark) },
        ]"
        @click="tool.mark === 'link' ? open() : toggle(tool.mark)"
      >
        <v-icon :icon="tool.icon" size="small" />
      </button>
    </div>
    <form v-if="isOpen" class="rich-text-editor__link" @submit.prevent="apply">
      <label :for="linkId" class="rich-text-editor__link-label">{{ $t('link address') }}</label>
      <input
        :id="linkId"
        v-model="url"
        type="url"
        placeholder="https://"
        class="rich-text-editor__link-input"
      />
      <v-btn type="submit" size="small" color="primary">{{ $t('apply') }}</v-btn>
    </form>
    <EditorContent :editor :aria-label="label" class="rich-text-editor__content" />
  </div>
</template>

<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import type { RichTextMark } from '../composables/useRichTextEditor'

const model = defineModel<string>({ required: true })

defineProps({
  label: { type: String, required: true },
  invalid: { type: Boolean, default: false },
})

const { t } = useI18n()
const linkId = useId()
const { editor, isActive, toggle, setLink } = useRichTextEditor(model)
const { isOpen, url, open, apply } = useLinkPrompt(setLink)

const tools = computed<{ mark: RichTextMark; icon: string; label: string }[]>(() => [
  { mark: 'bold', icon: 'mdi-format-bold', label: t('bold') },
  { mark: 'italic', icon: 'mdi-format-italic', label: t('italic') },
  { mark: 'bulletList', icon: 'mdi-format-list-bulleted', label: t('bulleted list') },
  { mark: 'orderedList', icon: 'mdi-format-list-numbered', label: t('numbered list') },
  { mark: 'code', icon: 'mdi-code-tags', label: t('inline code') },
  { mark: 'codeBlock', icon: 'mdi-code-block-tags', label: t('code block') },
  { mark: 'link', icon: 'mdi-link-variant', label: t('link') },
])
</script>

<style scoped lang="scss">
.rich-text-editor {
  border: var(--cinq-border);
  background: var(--cinq-white);

  &--invalid {
    border-color: var(--cinq-red);
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 3px solid var(--cinq-ink);
  }

  &__tool {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border: 0;
    border-right: 3px solid var(--cinq-ink);
    background: var(--cinq-white);
    color: var(--cinq-ink);
    cursor: pointer;

    &--active {
      background: var(--cinq-yellow);
    }
  }

  &__link {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-bottom: 3px solid var(--cinq-ink);
    background: var(--cinq-cream);
  }

  &__link-label {
    font-size: 0.875rem;
    font-weight: 700;
  }

  &__link-input {
    flex: 1 1 min(100%, 12rem);
    min-width: 0;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    border: 3px solid var(--cinq-ink);
    font-family: var(--cinq-font-body);
    font-size: 1rem;
  }

  &__content {
    :deep(.tiptap) {
      min-height: 6rem;
      padding: 0.875rem 1rem;
      outline: none;
      font-size: 1.0625rem;
      line-height: 1.5;
    }

    :deep(.tiptap p) {
      margin: 0 0 0.5rem;
    }

    :deep(.tiptap ul),
    :deep(.tiptap ol) {
      padding-left: 1.5rem;
    }

    :deep(.tiptap code) {
      padding: 0.125rem 0.5rem;
      background: var(--cinq-ink);
      color: var(--cinq-cream);
    }

    :deep(.tiptap pre) {
      padding: 1rem 1.25rem;
      background: var(--cinq-ink);
      color: var(--cinq-cream);
      white-space: pre-wrap;
    }

    :deep(.tiptap pre code) {
      padding: 0;
      background: none;
    }
  }
}
</style>
