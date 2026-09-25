<template>
  <article class="revision-row">
    <div class="revision-row__select">
      <input
        :id="checkboxId"
        type="checkbox"
        :checked="selected"
        :disabled="learning.due_today_count === 0"
        :aria-label="$t('include “{title}” in the session', { title: learning.subject.title })"
        class="revision-row__checkbox"
        @change="emit('toggle', learning)"
      />
    </div>
    <div class="revision-row__main">
      <span class="revision-row__category">{{ learning.subject.category?.name }}</span>
      <NuxtLink :to="`/sujets/${learning.subject_id}`" class="revision-row__title">{{
        learning.subject.title
      }}</NuxtLink>
      <strong class="revision-row__due">
        {{
          learning.due_today_count > 0
            ? $t(
                '{count} cards to review | {count} card to review | {count} cards to review',
                learning.due_today_count,
              )
            : $t('nothing to review today')
        }}
      </strong>
      <span class="revision-row__next">{{
        $t('next review: {day}', { day: relativeDay(learning.next_review_on) })
      }}</span>
    </div>
    <div class="revision-row__boxes"><BoxBar :counts="boxCountsOf(learning)" /></div>
    <div class="revision-row__actions">
      <v-btn
        v-if="learning.due_today_count > 0"
        color="secondary"
        @click="emit('review', learning)"
      >
        {{ $t('review this subject') }}
      </v-btn>
      <v-btn variant="outlined" @click="emit('stop', learning)">{{ $t('stop learning') }}</v-btn>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  learning: { type: Object as PropType<Learning>, required: true },
  selected: { type: Boolean, required: true },
})
const emit = defineEmits<{ toggle: [Learning]; review: [Learning]; stop: [Learning] }>()

const checkboxId = useId()
const { relativeDay } = useRelativeDay()
</script>

<style scoped lang="scss">
.revision-row {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr) minmax(16rem, 26rem) 13rem;
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 6px 6px 0 var(--cinq-ink);

  &__select {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: var(--cinq-border);
    background: var(--cinq-cream);
  }

  &__checkbox {
    width: 1.75rem;
    height: 1.75rem;
    margin: 0;
    accent-color: var(--cinq-ink);
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
    padding: 1.125rem 1.375rem;
  }

  &__category {
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.125rem, 2vw + 0.5rem, 1.625rem);
    font-weight: 800;
    line-height: 1.1;
  }

  &__due {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.125rem, 2vw + 0.5rem, 1.625rem);
    font-weight: 900;
    line-height: 1;
  }

  &__next {
    font-size: 0.9375rem;
    color: var(--cinq-muted);
  }

  &__boxes {
    display: flex;
    align-items: center;
    padding: 1.125rem;
    border-left: var(--cinq-border);

    :deep(.box-bar) {
      width: 100%;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.125rem;
    border-left: var(--cinq-border);

    // Two long labels in a narrow column: smaller type, allowed to wrap.
    :deep(.v-btn) {
      padding-inline: 0.625rem;
      font-size: 0.8125rem;
      letter-spacing: 0;
    }

    :deep(.v-btn__content) {
      hyphens: auto;
    }
  }

  @media (max-width: 959px) {
    grid-template-columns: 3.5rem minmax(0, 1fr);

    &__boxes,
    &__actions {
      grid-column: 1 / -1;
      border-top: var(--cinq-border);
      border-left: 0;
    }

    &__actions {
      flex-direction: row;

      > * {
        flex: 1 1 0;
        min-width: 0;
      }
    }
  }
}
</style>
