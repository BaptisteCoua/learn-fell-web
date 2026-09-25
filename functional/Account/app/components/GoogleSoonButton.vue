<template>
  <div class="google-soon">
    <button type="button" disabled :aria-describedby="soonId" class="google-soon__button">
      <span class="google-soon__logo" aria-hidden="true">G</span>
      {{ $t('continue with google') }}
      <span :id="soonId" class="google-soon__badge">{{ $t('soon') }}</span>
    </button>
    <div class="google-soon__separator" aria-hidden="true">
      <span class="google-soon__line" />{{ $t('or with your email')
      }}<span class="google-soon__line" />
    </div>
  </div>
</template>

<script setup lang="ts">
const soonId = useId()
</script>

<style scoped lang="scss">
.google-soon {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    min-height: 4rem;
    padding: 0.5rem 1rem;
    border: 4px dashed var(--cinq-ink);
    background: var(--cinq-white);
    color: var(--cinq-ink);
    font-family: var(--cinq-font-body);
    font-size: clamp(1rem, 1vw + 0.75rem, 1.125rem);
    font-weight: 700;
    white-space: nowrap;
    cursor: not-allowed;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.875rem;
    height: 1.875rem;
    border: 3px solid var(--cinq-ink);
    font-family: var(--cinq-font-display);
    font-weight: 900;
  }

  &__badge {
    padding: 0.1875rem 0.5625rem;
    border: 2px solid var(--cinq-ink);
    background: var(--cinq-blue);
    font-size: 0.75rem;
    letter-spacing: 0.125rem;
    text-transform: uppercase;
  }

  &__separator {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;
  }

  &__line {
    flex-grow: 1;
    height: 3px;
    background: var(--cinq-ink);
  }
}
</style>
