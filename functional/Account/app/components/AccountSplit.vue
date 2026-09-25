<template>
  <div class="account-split">
    <section :class="['account-split__panel', `account-split__panel--${tone}`]">
      <div class="account-split__heading">
        <div class="account-split__eyebrow">{{ eyebrow }}</div>
        <h1 class="account-split__title">{{ title }}</h1>
      </div>
      <ul class="account-split__points">
        <li v-for="point in points" :key="point" class="account-split__point">{{ point }}</li>
      </ul>
    </section>
    <div class="account-split__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  eyebrow: { type: String, required: true },
  // Line breaks in the translation are kept.
  title: { type: String, required: true },
  points: { type: Array as PropType<string[]>, default: () => [] },
  tone: { type: String as PropType<'yellow' | 'blue'>, default: 'yellow' },
})
</script>

<style scoped lang="scss">
.account-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-height: calc(100dvh - 92px);

  &__panel {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 3rem;
    padding: clamp(2rem, 6vw, 5.5rem) clamp(1rem, 5vw, 4rem);
    border-right: var(--cinq-border);

    &--yellow {
      background: var(--cinq-yellow);
    }

    &--blue {
      background: var(--cinq-blue);
    }
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 1.125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.75rem, 8vw, 7rem);
    line-height: 0.86;
    text-transform: uppercase;
    white-space: pre-line;
  }

  &__points {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    margin: 0;
    padding: 0;
    font-size: clamp(1.0625rem, 1vw + 0.75rem, 1.3125rem);
    font-weight: 700;
    list-style: none;
  }

  &__point {
    padding-top: 0.875rem;
    border-top: 3px solid var(--cinq-ink);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 40rem;
    padding: clamp(2rem, 6vw, 5.5rem) clamp(1rem, 5vw, 4rem);
  }

  @media (max-width: 959px) {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;

    &__panel {
      gap: 1.5rem;
      border-right: 0;
      border-bottom: var(--cinq-border);
    }

    &__points {
      display: none;
    }
  }
}
</style>
