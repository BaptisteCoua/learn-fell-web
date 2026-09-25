<template>
  <section class="session-summary">
    <div class="session-summary__eyebrow">{{ $t('session over') }}</div>
    <h1 class="session-summary__title">{{ $t('summary') }}</h1>
    <div class="session-summary__scores">
      <div class="session-summary__score session-summary__score--known">
        <strong>{{ known }}</strong
        ><span>{{ $t('i knew') }}</span>
      </div>
      <div class="session-summary__score">
        <strong>{{ missed }}</strong
        ><span>{{ $t('i did not know') }}</span>
      </div>
    </div>
    <p class="session-summary__text">
      {{
        missed > 0
          ? $t(
              '{count} cards will come back tomorrow in box 1. | {count} card will come back tomorrow in box 1. | {count} cards will come back tomorrow in box 1.',
              missed,
            )
          : $t('no card goes back to box 1.')
      }}
      <template v-if="nextReviewOn"
        >{{ $t('next review: {day}', { day: relativeDay(nextReviewOn).toLowerCase() }) }}.</template
      >
    </p>
    <div class="session-summary__boxes">
      <span class="session-summary__label">{{ $t('your boxes, subjects of the session') }}</span>
      <BoxBar :counts="boxCounts" />
    </div>
    <div class="cinq-actions">
      <v-btn to="/revisions" color="primary" size="x-large">{{ $t('back to my reviews') }}</v-btn>
      <v-btn to="/categories" variant="outlined" size="x-large">{{
        $t('explore the catalogue')
      }}</v-btn>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  known: { type: Number, required: true },
  missed: { type: Number, required: true },
  boxCounts: { type: Array as PropType<number[]>, required: true },
  nextReviewOn: { type: String as PropType<string | null>, default: null },
})

const { relativeDay } = useRelativeDay()
</script>

<style scoped lang="scss">
.session-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 48rem;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 2rem);

  &__eyebrow,
  &__label {
    font-family: var(--cinq-font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.75rem, 10vw, 6rem);
    line-height: 0.86;
    text-transform: uppercase;
  }

  &__scores {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  &__score {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.25rem;
    border: var(--cinq-border);
    background: var(--cinq-white);
    box-shadow: 6px 6px 0 var(--cinq-ink);
    font-weight: 700;

    strong {
      font-family: var(--cinq-font-display);
      font-size: clamp(2.5rem, 8vw, 4rem);
      font-weight: 900;
      line-height: 0.9;
    }

    &--known {
      background: var(--cinq-yellow);
    }
  }

  &__text {
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  &__boxes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
