<template>
  <article class="question-item">
    <div class="question-item__number" aria-hidden="true">{{ number }}</div>
    <div class="question-item__body">
      <div class="question-item__recto">
        <RichTextView :html="question.recto_html" class="question-item__question" />
        <v-btn
          color="primary"
          :aria-expanded="isRevealed"
          :aria-controls="answerId"
          @click="emit('toggle')"
        >
          {{ isRevealed ? $t('hide the answer') : $t('show the answer') }}
        </v-btn>
      </div>
      <div v-if="isRevealed" :id="answerId" class="question-item__answer">
        <RichTextView :html="question.verso_html" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  question: { type: Object as PropType<Question>, required: true },
  index: { type: Number, required: true },
  isRevealed: { type: Boolean, required: true },
})
const emit = defineEmits(['toggle'])

const answerId = useId()
const number = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<style scoped lang="scss">
.question-item {
  display: grid;
  grid-template-columns: clamp(3.5rem, 8vw, 6rem) minmax(0, 1fr);
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 8px 8px 0 var(--cinq-ink);

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: var(--cinq-border);
    background: var(--cinq-yellow);
    font-family: var(--cinq-font-display);
    font-size: clamp(1.5rem, 4vw, 2.75rem);
    font-weight: 900;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: clamp(1rem, 3vw, 1.75rem) clamp(1rem, 3vw, 2rem);
  }

  &__recto {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem 1.5rem;
  }

  &__question {
    flex: 1 1 18rem;
    font-family: var(--cinq-font-display);
    font-size: clamp(1.25rem, 2vw + 0.5rem, 1.75rem);
    font-weight: 800;
    line-height: 1.15;
  }

  &__answer {
    padding-top: 1.25rem;
    border-top: 3px dashed var(--cinq-ink);
    font-size: clamp(1rem, 1vw + 0.75rem, 1.1875rem);
  }
}
</style>
