<template>
  <div class="session-card">
    <div class="session-card__meta">
      <span class="session-card__subject">{{ card.subject.title }}</span>
      <span class="session-card__box">{{ boxText }}</span>
    </div>
    <section :aria-label="$t('recto')" class="session-card__face">
      <span class="session-card__label">{{ $t('recto') }}</span>
      <RichTextView :html="card.question.recto_html" class="session-card__recto" />
      <span v-if="!isRevealed" class="session-card__hint">{{
        $t('think about the answer, then flip the card.')
      }}</span>
    </section>
    <section
      v-if="isRevealed"
      :aria-label="$t('verso')"
      class="session-card__face session-card__face--verso"
    >
      <span class="session-card__label">{{ $t('verso') }}</span>
      <RichTextView :html="card.question.verso_html" />
    </section>

    <p v-if="saveFailed" role="alert" class="session-card__error">
      <strong>{{ $t('your answer could not be saved.') }}</strong>
      {{
        $t('check your connection, then answer again. the card keeps its box until it is saved.')
      }}
    </p>

    <v-btn v-if="!isRevealed" color="primary" size="x-large" block @click="emit('reveal')">
      {{ $t('show the answer') }}
    </v-btn>
    <div v-else-if="!result" class="cinq-actions">
      <v-btn
        variant="outlined"
        size="x-large"
        :disabled="isAnswering"
        @click="emit('answer', false)"
      >
        <span class="session-card__choice"
          >{{ $t('i did not know') }}<small>{{ $t('back to box 1') }}</small></span
        >
      </v-btn>
      <v-btn color="secondary" size="x-large" :disabled="isAnswering" @click="emit('answer', true)">
        <span class="session-card__choice"
          >{{ $t('i knew') }}<small>{{ $t('next box') }}</small></span
        >
      </v-btn>
    </div>
    <div
      v-else
      role="status"
      :class="['session-card__result', { 'session-card__result--missed': !result.known }]"
    >
      <strong>{{ moveText }}</strong>
      <span>{{ whenText }}</span>
      <v-btn color="primary" size="large" @click="emit('next')">
        {{ isLast ? $t('see the summary') : $t('next card') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IAnswerResult } from '../composables/useReviewSession'

const props = defineProps({
  card: { type: Object as PropType<CardProgress>, required: true },
  isRevealed: { type: Boolean, required: true },
  isAnswering: { type: Boolean, default: false },
  saveFailed: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
  result: { type: Object as PropType<IAnswerResult>, default: undefined },
})
const emit = defineEmits<{ reveal: []; answer: [boolean]; next: [] }>()

const { t } = useI18n()
const { relativeDay } = useRelativeDay()

const boxText = computed(() => t('box {box}', { box: props.card.box }))
const moveText = computed(() => {
  if (!props.result) {
    return ''
  }

  if (!props.result.known) {
    return t('back to box 1')
  }

  return props.result.fromBox === props.result.toBox
    ? t('stays in box 5')
    : t('box {from} → box {to}', { from: props.result.fromBox, to: props.result.toBox })
})
const whenText = computed(() =>
  props.result
    ? t('comes back: {day}', { day: relativeDay(props.result.nextReviewOn).toLowerCase() })
    : '',
)
</script>

<style scoped lang="scss">
.session-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
    font-weight: 700;
  }

  &__subject {
    font-family: var(--cinq-font-mono);
    font-size: 0.875rem;
    text-transform: uppercase;
  }

  &__box {
    padding: 0.125rem 0.625rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
  }

  &__face {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: clamp(1.25rem, 4vw, 2rem);
    border: var(--cinq-border);
    background: var(--cinq-white);
    box-shadow: 8px 8px 0 var(--cinq-ink);

    &--verso {
      background: var(--cinq-blue);
    }
  }

  &__label {
    align-self: flex-start;
    padding: 0.25rem 0.625rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-yellow);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.154em;
    text-transform: uppercase;
  }

  &__recto {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.375rem, 4vw, 2.25rem);
    font-weight: 900;
    line-height: 1.1;
  }

  &__hint {
    font-size: 0.9375rem;
  }

  &__choice {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    line-height: 1.1;

    small {
      font-family: var(--cinq-font-body);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: none;
    }
  }

  &__error {
    margin: 0;
    padding: 0.875rem 1rem;
    border: 4px solid var(--cinq-red);
    background: var(--cinq-white);
  }

  &__result {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1.25rem;
    padding: 1rem 1.25rem;
    border: var(--cinq-border);
    background: var(--cinq-yellow);
    font-size: 1.0625rem;

    strong {
      font-family: var(--cinq-font-display);
      font-size: 1.375rem;
      font-weight: 900;
    }

    .v-btn {
      margin-left: auto;
    }

    &--missed {
      background: var(--cinq-white);
    }
  }

  :deep(.v-btn--size-x-large) {
    min-height: 4.5rem;
  }
}
</style>
