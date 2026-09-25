<template>
  <section :aria-label="$t('learning')" class="learn-subject-panel">
    <template v-if="!learning">
      <div class="learn-subject-panel__intro">
        <strong class="learn-subject-panel__title">{{ $t('learn this subject') }}</strong>
        <span>{{
          $t('its {count} cards will go into your box 1, to review from today.', {
            count: questionCount,
          })
        }}</span>
      </div>
      <v-btn
        color="secondary"
        size="x-large"
        :loading="isBusy"
        :disabled="questionCount === 0"
        @click="learn"
      >
        {{ $t('start learning this subject') }}
      </v-btn>
    </template>

    <template v-else>
      <div class="learn-subject-panel__intro">
        <span class="learn-subject-panel__eyebrow">{{ $t('you are learning this subject') }}</span>
        <strong class="learn-subject-panel__title">
          {{
            dueCount > 0
              ? $t(
                  '{count} cards to review today | {count} card to review today | {count} cards to review today',
                  dueCount,
                )
              : $t('nothing to review today')
          }}
        </strong>
      </div>
      <BoxBar :counts="boxCounts" />
      <div class="cinq-actions">
        <v-btn
          :to="{ path: '/revisions/seance', query: { sujets: String(subjectId) } }"
          color="secondary"
          size="large"
          :disabled="dueCount === 0"
        >
          {{ $t('review this subject') }}
        </v-btn>
        <v-btn variant="outlined" size="large" @click="askToStop">{{ $t('stop learning') }}</v-btn>
      </div>
    </template>

    <ConfirmDialog
      :open="isStopDialogOpen"
      :title="$t('stop learning?')"
      :confirm-label="$t('stop learning')"
      danger
      @close="closeStopDialog"
      @confirm="stop"
    >
      {{
        $t(
          'you will no longer learn this subject. all its progress (boxes and review dates) will be deleted.',
        )
      }}
    </ConfirmDialog>
  </section>
</template>

<script setup lang="ts">
const props = defineProps({
  subjectId: { type: Number, required: true },
  questionCount: { type: Number, required: true },
})

const {
  learning,
  boxCounts,
  dueCount,
  isStopDialogOpen,
  isBusy,
  learn,
  stop,
  askToStop,
  closeStopDialog,
} = await useLearningPanel(props.subjectId)
</script>

<style scoped lang="scss">
.learn-subject-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  padding: 2rem clamp(1rem, 5vw, 4rem);
  border-bottom: var(--cinq-border);
  background: var(--cinq-white);

  &__intro {
    display: flex;
    flex: 1 1 min(100%, 20rem);
    min-width: 0;
    flex-direction: column;
    gap: 0.375rem;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    font-family: var(--cinq-font-display);
    font-size: clamp(1.375rem, 3vw, 2rem);
    font-weight: 900;
    text-transform: uppercase;
  }

  :deep(.box-bar) {
    flex: 1 1 min(100%, 22rem);
    min-width: 0;
  }

  .cinq-actions {
    flex: 1 1 min(100%, 22rem);
    min-width: 0;
  }
}
</style>
