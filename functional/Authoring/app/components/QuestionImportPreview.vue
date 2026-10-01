<template>
  <section class="question-import-preview">
    <div class="question-import-preview__summary">
      <h2 class="question-import-preview__title">
        {{ $t('{count} questions to import', preview.question_count) }}
      </h2>
      <p
        v-for="sourceError in preview.errors"
        :key="sourceError.code"
        role="alert"
        class="question-import-preview__error"
      >
        {{ sourceError.message }}
      </p>
      <div v-if="linesToFix.length > 0" class="question-import-preview__to-fix">
        <strong>{{ $t('{count} lines to fix', preview.error_line_count) }}</strong>
        <ul class="question-import-preview__links">
          <li v-for="row in linesToFix" :key="row.line">
            <a :href="`#ligne-${row.line}`" class="cinq-standalone-link">{{
              $t('line {line}', { line: row.line })
            }}</a>
          </li>
        </ul>
      </div>
      <AccountNotice
        v-if="hasLearners"
        tone="info"
        :title="
          $t(
            'the imported questions will enter box 1 for the people learning this subject, to review from today.',
          )
        "
      />
      <ul v-if="preview.notices.length > 0" class="question-import-preview__notices">
        <li v-for="notice in preview.notices" :key="notice.code">{{ notice.message }}</li>
      </ul>
    </div>

    <div class="question-import-preview__rows">
      <QuestionImportRow v-for="row in preview.rows" :key="row.line" :row />
    </div>

    <div class="question-import-preview__footer">
      <p v-if="error" role="alert" class="question-import-preview__error">{{ error }}</p>
      <p v-if="isOffline" class="question-import-preview__offline">
        {{ $t('you are offline: the import resumes with the connection.') }}
      </p>
      <div class="question-import-preview__actions">
        <v-btn variant="outlined" size="large" :disabled="isImporting" @click="emit('back')">{{
          $t('change the source')
        }}</v-btn>
        <v-btn
          color="primary"
          size="large"
          :disabled="!preview.can_confirm || isOffline"
          :loading="isImporting"
          @click="emit('confirm')"
          >{{ $t('import {count} questions', preview.question_count) }}</v-btn
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IImportPreview } from '../composables/useQuestionImport'

const props = defineProps({
  preview: { type: Object as PropType<IImportPreview>, required: true },
  isImporting: { type: Boolean, default: false },
  hasLearners: { type: Boolean, default: false },
  error: { type: String, default: null },
})
const emit = defineEmits<{ confirm: []; back: [] }>()

const { isOffline } = useConnectionStatus()
const linesToFix = computed(() => props.preview.rows.filter((row) => row.errors.length > 0))
</script>

<style scoped lang="scss">
.question-import-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__summary {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__title {
    margin: 0;
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    text-transform: uppercase;
  }

  &__to-fix {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border: 3px solid var(--cinq-red);
    background: var(--cinq-white);
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__notices {
    margin: 0;
    padding-left: 1.25rem;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__footer {
    position: sticky;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0 calc(1rem + env(safe-area-inset-bottom, 0px));
    border-top: var(--cinq-border);
    background: var(--cinq-cream);
  }

  &__error {
    margin: 0;
    color: var(--cinq-red);
    font-weight: 700;
  }

  &__offline {
    margin: 0;
    font-weight: 700;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.75rem;
  }
}
</style>
