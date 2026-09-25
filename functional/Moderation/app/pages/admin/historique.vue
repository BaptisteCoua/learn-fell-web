<template>
  <div class="moderation-history">
    <section class="moderation-history__hero">
      <div>
        <div class="moderation-history__eyebrow">{{ $t('administration / history') }}</div>
        <h1 class="moderation-history__title">{{ $t('history') }}</h1>
      </div>
      <p class="moderation-history__lead">
        {{ $t('every decision is kept: who, when, which decision, which reason.') }}
      </p>
    </section>

    <section class="moderation-history__content">
      <div class="moderation-history__main">
        <div
          role="group"
          :aria-label="$t('filter the decisions')"
          class="moderation-history__filters"
        >
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            :aria-pressed="filter === option.value"
            :class="[
              'moderation-history__filter',
              { 'moderation-history__filter--active': filter === option.value },
            ]"
            @click="filter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <p v-if="shownDecisions.length === 0">{{ $t('no decision yet.') }}</p>
        <ul class="moderation-history__list">
          <li v-for="decision in shownDecisions" :key="decision.id" class="moderation-history__row">
            <span class="moderation-history__date">{{ dateOf(decision.created_at) }}</span>
            <span
              :class="[
                'moderation-history__decision',
                `moderation-history__decision--${decision.decision}`,
              ]"
            >
              {{ decisionLabels[decision.decision] }}
            </span>
            <strong class="moderation-history__subject">{{ decision.subject_title }}</strong>
            <span>{{ decision.admin?.display_name }}</span>
            <span class="moderation-history__reason">{{ decision.reason || '—' }}</span>
          </li>
        </ul>
      </div>

      <aside class="moderation-history__retired">
        <h2 class="moderation-history__retired-title">{{ $t('retired subjects') }}</h2>
        <div v-for="subject in retiredSubjects" :key="subject.id" class="moderation-history__card">
          <strong>{{ subject.title }}</strong>
          <span>{{ $t('by {name}', { name: subject.author?.display_name }) }}</span>
          <span class="moderation-history__reason">{{
            $t('reason: {reason}', { reason: subject.retired_reason ?? '—' })
          }}</span>
          <div class="cinq-actions">
            <v-btn color="secondary" @click="askToRestore(subject)">{{ $t('restore') }}</v-btn>
            <v-btn :to="`/sujets/${subject.id}/modifier`" variant="outlined">{{
              $t('consult')
            }}</v-btn>
          </div>
        </div>
        <p v-if="retiredSubjects.length === 0" class="moderation-history__none">
          {{ $t('no retired subject.') }}
        </p>
      </aside>
    </section>

    <ConfirmDialog
      :open="restoreTarget !== null"
      :title="$t('restore “{title}”?', { title: restoreTarget?.title })"
      :confirm-label="$t('restore the subject')"
      @close="closeRestore"
      @confirm="confirmRestore"
    >
      {{
        $t(
          'the subject becomes a draft of its author again. they can edit it and publish it again.',
        )
      }}
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'permission', permission: 'moderation.history.view' })

const { t } = useI18n()
const {
  shownDecisions,
  retiredSubjects,
  filter,
  restoreTarget,
  askToRestore,
  closeRestore,
  confirmRestore,
} = await useModerationHistory()

const filterOptions = computed<{ value: DecisionFilter; label: string }[]>(() => [
  { value: 'all', label: t('all decisions') },
  { value: 'retired', label: t('retirements') },
  { value: 'ignored', label: t('ignored reports') },
  { value: 'restored', label: t('restorations') },
])
const decisionLabels = computed(() => ({
  ignored: t('ignored'),
  retired: t('retired'),
  restored: t('restored'),
}))
const dateOf = (isoDate: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(isoDate),
  )

useHead({ title: () => t('history') })
</script>

<style scoped lang="scss">
.moderation-history {
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 25rem);
    align-items: start;
    gap: 2.5rem;
    padding: 2.5rem clamp(1rem, 5vw, 4rem);
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  &__filter {
    min-height: 3rem;
    padding: 0 1rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-white);
    color: var(--cinq-ink);
    font-family: var(--cinq-font-body);
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;

    &--active {
      background: var(--cinq-ink);
      color: var(--cinq-cream);
    }
  }

  &__list {
    margin: 0;
    padding: 0;
    border: var(--cinq-border);
    background: var(--cinq-white);
    list-style: none;
  }

  &__row {
    display: grid;
    grid-template-columns: 10rem 8rem minmax(0, 1.2fr) 9rem minmax(0, 1fr);
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;

    & + & {
      border-top: 3px solid var(--cinq-ink);
    }
  }

  &__decision {
    align-self: center;
    justify-self: start;
    padding: 0.25rem 0.625rem;
    border: 3px solid var(--cinq-ink);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;

    &--retired {
      background: var(--cinq-ink);
      color: var(--cinq-cream);
    }

    &--ignored {
      background: var(--cinq-white);
    }

    &--restored {
      background: var(--cinq-blue);
    }
  }

  &__subject {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &__reason {
    color: var(--cinq-muted);
  }

  &__retired {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__retired-title {
    margin: 0;
    font-size: clamp(1.5rem, 3vw, 2rem);
    text-transform: uppercase;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 1.25rem;
    border: var(--cinq-border);
    background: var(--cinq-white);
    box-shadow: 6px 6px 0 var(--cinq-ink);

    strong {
      font-family: var(--cinq-font-display);
      font-size: 1.375rem;
      font-weight: 800;
    }
  }

  &__none {
    padding: 1.5rem;
    border: 4px dashed var(--cinq-ink);
    background: var(--cinq-white);
  }

  @media (max-width: 1199px) {
    &__content {
      grid-template-columns: minmax(0, 1fr);
    }

    &__row {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    &__subject,
    &__reason {
      grid-column: 1 / -1;
    }
  }
}
</style>
