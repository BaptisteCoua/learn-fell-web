<template>
  <div class="revisions-page">
    <section class="revisions-page__hero">
      <div>
        <div class="revisions-page__eyebrow">
          {{ $t('leitner review · {count} cards to review today', { count: allDueCount }) }}
        </div>
        <h1 class="revisions-page__title">{{ $t('my reviews') }}</h1>
      </div>
      <v-btn
        v-if="selectedDueCount > 0"
        color="secondary"
        size="x-large"
        class="revisions-page__start"
        @click="startSession()"
      >
        {{
          $t(
            'review the selection · {count} cards | review the selection · {count} card | review the selection · {count} cards',
            selectedDueCount,
          )
        }}
      </v-btn>
      <v-btn v-else-if="allDueCount > 0" variant="outlined" size="x-large" disabled>
        {{ $t('select at least one subject') }}
      </v-btn>
    </section>

    <section class="revisions-page__content">
      <div v-if="learnings.length === 0" class="revisions-page__empty">
        <h2 class="revisions-page__empty-title">{{ $t('you are not learning any subject') }}</h2>
        <p>
          {{
            $t(
              'open a subject of the catalogue and choose “learn this subject”: its cards will go into your box 1.',
            )
          }}
        </p>
        <v-btn to="/categories" color="secondary" size="x-large">{{
          $t('explore the catalogue')
        }}</v-btn>
      </div>

      <template v-else>
        <AccountNotice
          v-if="allDueCount === 0"
          tone="success"
          :title="$t('nothing to review today.')"
          :text="
            nextLearning
              ? $t('next review: {day}, “{title}”. a good time to learn a new subject.', {
                  day: relativeDay(nextLearning.next_review_on).toLowerCase(),
                  title: nextLearning.subject.title,
                })
              : ''
          "
        />
        <div v-else class="revisions-page__selection">
          <span>{{
            $t(
              '{count} subjects selected | {count} subject selected | {count} subjects selected',
              selectedLearnings.length,
            )
          }}</span>
          <v-btn variant="outlined" size="small" @click="selectAll">{{ $t('select all') }}</v-btn>
          <v-btn variant="outlined" size="small" @click="selectNone">{{ $t('none') }}</v-btn>
        </div>

        <RevisionRow
          v-for="learning in learnings"
          :key="learning.id"
          :learning
          :selected="isSelected(learning)"
          @toggle="toggle"
          @review="(target) => startSession([target.subject_id])"
          @stop="askToStop"
        />
      </template>

      <p class="revisions-page__rule">
        {{
          $t(
            'a card you get right moves up a box (b1 → b5: 1, 2, 4, 8 then 16 days). a card you miss goes back to box 1 and comes back the next day.',
          )
        }}
      </p>
    </section>

    <ConfirmDialog
      :open="stopTarget !== null"
      :title="$t('stop learning?')"
      :confirm-label="$t('stop learning')"
      danger
      @close="closeStopDialog"
      @confirm="confirmStop"
    >
      {{
        $t(
          'you will no longer learn “{title}”. all its progress (boxes and review dates) will be deleted.',
          { title: stopTarget?.subject.title },
        )
      }}
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { relativeDay } = useRelativeDay()
const {
  learnings,
  allDueCount,
  selectedLearnings,
  selectedDueCount,
  nextLearning,
  stopTarget,
  isSelected,
  toggle,
  selectAll,
  selectNone,
  startSession,
  askToStop,
  closeStopDialog,
  confirmStop,
} = await useRevisions()

useHead({ title: () => t('my reviews') })
</script>

<style scoped lang="scss">
.revisions-page {
  &__hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 4rem) 2rem;
    border-bottom: var(--cinq-border);
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 0.9375rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0.5rem 0 0;
    font-size: clamp(2.5rem, 9vw, 7rem);
    line-height: 0.86;
    text-transform: uppercase;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 2rem clamp(1rem, 5vw, 4rem) 4rem;
  }

  &__selection {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
    font-weight: 700;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: clamp(1.5rem, 5vw, 3.5rem);
    border: 4px dashed var(--cinq-ink);
    background: var(--cinq-white);
    font-size: 1.125rem;
  }

  &__empty-title {
    margin: 0;
    font-size: var(--cinq-text-h2);
    text-transform: uppercase;
  }

  &__rule {
    margin: 0.5rem 0 0;
    color: var(--cinq-muted);
  }

  @media (max-width: 959px) {
    &__start {
      position: sticky;
      bottom: 80px;
      z-index: 4;
      width: 100%;
    }
  }
}
</style>
