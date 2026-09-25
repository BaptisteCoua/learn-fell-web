<template>
  <article class="question-card">
    <div class="question-card__number" aria-hidden="true">{{ number }}</div>
    <div class="question-card__faces">
      <div class="question-card__face">
        <span class="question-card__label">{{ $t('recto') }}</span>
        <RichTextView :html="question.recto_html" />
      </div>
      <div class="question-card__face question-card__face--verso">
        <span class="question-card__label">{{ $t('verso') }}</span>
        <RichTextView :html="question.verso_html" />
      </div>
    </div>
    <div v-if="editable" class="question-card__tools">
      <v-btn
        icon="mdi-arrow-up"
        variant="outlined"
        size="small"
        :disabled="isFirst"
        :aria-label="$t('move question {number} up', { number })"
        @click="emit('move', -1)"
      />
      <v-btn
        icon="mdi-arrow-down"
        variant="outlined"
        size="small"
        :disabled="isLast"
        :aria-label="$t('move question {number} down', { number })"
        @click="emit('move', 1)"
      />
      <v-btn
        icon="mdi-pencil-outline"
        variant="outlined"
        size="small"
        :aria-label="$t('edit question {number}', { number })"
        @click="emit('edit')"
      />
      <v-btn
        icon="mdi-delete-outline"
        variant="outlined"
        size="small"
        :aria-label="$t('delete question {number}', { number })"
        @click="emit('delete')"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  question: { type: Object as PropType<Question>, required: true },
  index: { type: Number, required: true },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
})
const emit = defineEmits<{ move: [-1 | 1]; edit: []; delete: [] }>()

const number = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<style scoped lang="scss">
.question-card {
  display: grid;
  grid-template-columns: clamp(3rem, 7vw, 5rem) minmax(0, 1fr) auto;
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 6px 6px 0 var(--cinq-ink);

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: var(--cinq-border);
    background: var(--cinq-yellow);
    font-family: var(--cinq-font-display);
    font-size: clamp(1.25rem, 3vw, 2rem);
    font-weight: 900;
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

  &__label {
    font-family: var(--cinq-font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__tools {
    display: grid;
    grid-template-columns: repeat(2, auto);
    align-content: center;
    gap: 0.375rem;
    padding: 0.75rem;
    border-left: var(--cinq-border);
  }

  @media (max-width: 599px) {
    grid-template-columns: 3rem minmax(0, 1fr);

    &__face--verso {
      border-top: 3px dashed var(--cinq-ink);
      border-left: 0;
    }

    &__tools {
      display: flex;
      grid-column: 1 / -1;
      justify-content: flex-end;
      border-top: var(--cinq-border);
      border-left: 0;
    }
  }
}
</style>
