<template>
  <SessionSummary
    v-if="isDone"
    :known="knownCount"
    :missed="missedCount"
    :box-counts="summaryBoxCounts"
    :next-review-on="nextReviewOn"
  />

  <div v-else class="session-page">
    <header class="session-page__header">
      <span class="session-page__eyebrow">{{
        $t('session · {count} cards', { count: cards.length })
      }}</span>
      <span v-if="current" class="session-page__position"
        >{{ index + 1 }} / {{ cards.length }}</span
      >
      <v-btn
        variant="outlined"
        size="small"
        @click="answeredCount > 0 ? askToQuit() : navigateTo('/revisions')"
      >
        {{ $t('quit') }}
      </v-btn>
    </header>
    <div class="session-page__progress" aria-hidden="true">
      <div class="session-page__bar" :style="progressStyle" />
    </div>

    <main class="session-page__main">
      <SessionCard
        v-if="current"
        :card="current"
        :is-revealed="isRevealed"
        :is-answering="isAnswering"
        :save-failed="saveFailed"
        :is-last="isLast"
        :result="currentResult"
        @reveal="reveal"
        @answer="answer"
        @next="next"
      />
      <div v-else class="session-page__empty">
        <h1 class="session-page__empty-title">{{ $t('nothing to review') }}</h1>
        <p>{{ $t('no card of these subjects is due today.') }}</p>
        <v-btn to="/revisions" color="primary" size="x-large">{{ $t('back to my reviews') }}</v-btn>
      </div>
    </main>

    <ConfirmDialog
      :open="isQuitDialogOpen"
      :title="$t('quit the session?')"
      :cancel-label="$t('continue')"
      :confirm-label="$t('quit')"
      @close="closeQuitDialog"
      @confirm="navigateTo('/revisions')"
    >
      {{
        $t(
          'your {answered} answers are already saved. the {remaining} remaining cards stay to review today.',
          {
            answered: answeredCount,
            remaining: remainingCount,
          },
        )
      }}
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const {
  cards,
  current,
  currentResult,
  index,
  isRevealed,
  isAnswering,
  saveFailed,
  isQuitDialogOpen,
  isDone,
  isLast,
  answeredCount,
  remainingCount,
  progressStyle,
  knownCount,
  missedCount,
  summaryBoxCounts,
  nextReviewOn,
  reveal,
  answer,
  next,
  askToQuit,
  closeQuitDialog,
} = await useReviewSession()

useHead({ title: () => t('review session') })
</script>

<style scoped lang="scss">
.session-page {
  max-width: 52rem;
  margin: 0 auto;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.25rem;
    padding: 1.25rem clamp(1rem, 4vw, 2rem);
  }

  &__eyebrow {
    flex-grow: 1;
    font-family: var(--cinq-font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__position {
    padding: 0.25rem 0.75rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-family: var(--cinq-font-display);
    font-weight: 900;
  }

  &__progress {
    height: 10px;
    margin: 0 clamp(1rem, 4vw, 2rem);
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-white);
  }

  &__bar {
    height: 100%;
    background: var(--cinq-yellow);
  }

  &__main {
    padding: 1.5rem clamp(1rem, 4vw, 2rem) 3rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  &__empty-title {
    margin: 0;
    font-size: var(--cinq-text-h2);
    text-transform: uppercase;
  }
}
</style>
