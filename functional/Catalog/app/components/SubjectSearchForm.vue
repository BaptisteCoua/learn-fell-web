<template>
  <form
    role="search"
    :class="['subject-search-form', `subject-search-form--${size}`]"
    @submit.prevent="submit"
  >
    <label :for="inputId" class="subject-search-form__label">{{
      $t('search for a subject')
    }}</label>
    <input
      :id="inputId"
      v-model="text"
      type="search"
      :placeholder="$t('search for a subject, a tag…')"
      class="subject-search-form__input"
    />
    <button type="submit" :aria-label="$t('search')" class="subject-search-form__button">
      <v-icon icon="mdi-magnify" />
      <span v-if="size !== 'compact'" class="subject-search-form__button-text">{{
        $t('search')
      }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  targetPath: { type: String, default: '/recherche' },
  initialText: { type: String, default: '' },
  size: { type: String as PropType<'compact' | 'large'>, default: 'compact' },
})

const inputId = useId()
const { text, submit } = useSearchForm(props.targetPath, props.initialText)
</script>

<style scoped lang="scss">
.subject-search-form {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 8px 8px 0 var(--cinq-ink);

  &__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  &__input {
    flex-grow: 1;
    min-width: 0;
    height: 4rem;
    padding: 0 1.25rem;
    border: 0;
    background: transparent;
    color: var(--cinq-ink);
    font-family: var(--cinq-font-body);
    font-size: 1.25rem;
  }

  &__button {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-width: 4.5rem;
    padding: 0 1.25rem;
    border: 0;
    border-left: var(--cinq-border);
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-family: var(--cinq-font-display);
    font-size: 1.25rem;
    font-weight: 900;
    text-transform: uppercase;
    cursor: pointer;
  }

  &--large {
    box-shadow: 10px 10px 0 var(--cinq-ink);
  }

  &--large &__input {
    height: clamp(4rem, 8vw, 6rem);
    font-family: var(--cinq-font-display);
    font-size: clamp(1.25rem, 3vw + 0.5rem, 2.5rem);
    font-weight: 800;
  }

  @media (max-width: 599px) {
    &__button-text {
      display: none;
    }
  }
}
</style>
