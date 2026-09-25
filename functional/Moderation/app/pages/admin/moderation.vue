<template>
  <div class="moderation-queue">
    <section class="moderation-queue__hero">
      <div>
        <div class="moderation-queue__eyebrow">
          {{ $t('administration / pending reports · {count}', { count: groups.length }) }}
        </div>
        <h1 class="moderation-queue__title">{{ $t('moderation') }}</h1>
      </div>
      <p class="moderation-queue__lead">
        {{
          $t(
            'from the oldest report to the most recent. a reported subject stays visible until you decide.',
          )
        }}
      </p>
    </section>

    <section class="moderation-queue__content">
      <ReportGroupCard
        v-for="group in groups"
        :key="group.subject.id"
        :group
        @ignore="ignoreGroup"
        @retire="askToRetire"
      />
      <div v-if="groups.length === 0" class="moderation-queue__empty">
        <h2 class="moderation-queue__empty-title">{{ $t('empty queue') }}</h2>
        <p>{{ $t('no pending report. new reports will show here as soon as they are sent.') }}</p>
        <v-btn to="/admin/historique" variant="outlined" size="x-large">{{
          $t('see the history')
        }}</v-btn>
      </div>
    </section>

    <RetireSubjectDialog
      v-if="retireTarget"
      :open="true"
      :subject-id="retireTarget.subject.id"
      :title="retireTarget.subject.title"
      :report-count="retireTarget.reports.length"
      @close="closeRetire"
      @retired="onRetired"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'permission', permission: 'reports.review' })

const { t } = useI18n()
const { groups, retireTarget, ignoreGroup, askToRetire, closeRetire, onRetired } =
  await useModerationQueue()

useHead({ title: () => t('moderation') })
</script>

<style scoped lang="scss">
.moderation-queue {
  &__hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem 2.5rem;
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
    font-size: clamp(2.5rem, 9vw, 6.5rem);
    line-height: 0.86;
    text-transform: uppercase;
  }

  &__lead {
    max-width: 28rem;
    margin: 0;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: 2.5rem clamp(1rem, 5vw, 4rem);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: clamp(1.5rem, 5vw, 4rem);
    border: 4px dashed var(--cinq-ink);
    background: var(--cinq-white);
    font-size: 1.125rem;

    p {
      margin: 0;
    }
  }

  &__empty-title {
    margin: 0;
    font-size: var(--cinq-text-h2);
    text-transform: uppercase;
  }
}
</style>
