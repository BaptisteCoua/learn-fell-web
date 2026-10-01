<template>
  <article
    :id="`ligne-${row.line}`"
    :class="['question-import-row', { 'question-import-row--invalid': row.errors.length > 0 }]"
  >
    <div class="question-import-row__line">{{ $t('line {line}', { line: row.line }) }}</div>
    <div class="question-import-row__faces">
      <div class="question-import-row__face">
        <span class="question-import-row__label">{{ $t('recto') }}</span>
        <RichTextView :html="row.recto_html" />
        <p
          v-for="error in errorsOf('recto')"
          :key="error.code"
          role="alert"
          class="question-import-row__error"
        >
          {{ error.message }}
        </p>
      </div>
      <div class="question-import-row__face question-import-row__face--verso">
        <span class="question-import-row__label">{{ $t('verso') }}</span>
        <RichTextView :html="row.verso_html" />
        <p
          v-for="error in errorsOf('verso')"
          :key="error.code"
          role="alert"
          class="question-import-row__error"
        >
          {{ error.message }}
        </p>
      </div>
    </div>
    <ul v-if="row.warnings.length > 0" class="question-import-row__warnings">
      <li v-for="warning in row.warnings" :key="warning.code">
        <v-icon icon="mdi-alert-outline" size="small" /> {{ warning.message }}
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IImportRow } from '../composables/useQuestionImport'

const props = defineProps({
  row: { type: Object as PropType<IImportRow>, required: true },
})

const errorsOf = (field: 'recto' | 'verso') =>
  props.row.errors.filter((error) => error.field === field)
</script>

<style scoped lang="scss">
.question-import-row {
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 6px 6px 0 var(--cinq-ink);
  scroll-margin-top: 5rem;

  &__line {
    padding: 0.5rem 1.25rem;
    border-bottom: var(--cinq-border);
    background: var(--cinq-yellow);
    font-family: var(--cinq-font-mono);
    font-weight: 600;
    text-transform: uppercase;
  }

  &__faces {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    min-width: 0;
  }

  &__face {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    padding: 1rem 1.25rem;

    &--verso {
      border-left: 3px dashed var(--cinq-ink);
    }
  }

  &--invalid {
    border-color: var(--cinq-red);
    box-shadow: 6px 6px 0 var(--cinq-red);
  }

  &--invalid &__line {
    background: var(--cinq-red);
    color: var(--cinq-white);
  }

  &__error {
    margin: 0;
    color: var(--cinq-red);
    font-weight: 700;
  }

  &__warnings {
    margin: 0;
    padding: 0.75rem 1.25rem;
    border-top: 3px dashed var(--cinq-ink);
    list-style: none;
    font-weight: 600;
  }

  &__label {
    font-family: var(--cinq-font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  @media (max-width: 599px) {
    &__face--verso {
      border-top: 3px dashed var(--cinq-ink);
      border-left: 0;
    }
  }
}
</style>
