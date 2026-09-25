<template>
  <NuxtLink :to="`/sujets/${subject.id}`" :class="['subject-card', `subject-card--${color}`]">
    <span class="subject-card__meta">
      {{ subject.category.name }} ·
      {{ $t('{count} questions', { count: subject.questions_count ?? 0 }) }}
    </span>
    <span class="subject-card__title"><HighlightedText :text="subject.title" :query /></span>
    <span class="subject-card__description">
      <HighlightedText :text="subject.description" :query />
    </span>
    <span class="subject-card__footer">
      <span>{{ $t('by {name}', { name: subject.author.display_name }) }}</span>
      <span class="subject-card__tags">
        <span v-for="tag in subject.tags" :key="tag.id" class="subject-card__tag">
          <HighlightedText :text="tag.name" :query />
        </span>
      </span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const COLORS = ['yellow', 'white', 'blue'] as const

const props = defineProps({
  subject: { type: Object as PropType<Subject>, required: true },
  index: { type: Number, default: 0 },
  query: { type: String, default: '' },
})

const color = computed(() => COLORS[props.index % COLORS.length])
</script>

<style scoped lang="scss">
.subject-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 18.75rem;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border: var(--cinq-border);
  box-shadow: 8px 8px 0 var(--cinq-ink);
  color: var(--cinq-ink);
  text-decoration: none;
  transition:
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    transform: translate(-6px, -6px);
    box-shadow: 14px 14px 0 var(--cinq-ink);
    color: var(--cinq-ink);
  }

  &--yellow {
    background: var(--cinq-yellow);
  }

  &--white {
    background: var(--cinq-white);
  }

  &--blue {
    background: var(--cinq-blue);
  }

  &__meta {
    font-family: var(--cinq-font-mono);
    font-size: 0.9375rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.75rem, 4vw + 0.5rem, 2.375rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.03em;
  }

  &__description {
    flex-grow: 1;
    font-size: 1.0625rem;
    line-height: 1.4;
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 700;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  &__tag {
    padding: 0.1875rem 0.5rem;
    border: 2px solid var(--cinq-ink);
  }
}
</style>
