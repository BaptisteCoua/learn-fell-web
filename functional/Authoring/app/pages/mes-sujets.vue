<template>
  <div class="my-subjects-page">
    <section class="my-subjects-page__hero">
      <div>
        <div class="my-subjects-page__eyebrow">{{ $t('author space') }}</div>
        <h1 class="my-subjects-page__title">{{ $t('my subjects') }}</h1>
      </div>
      <v-btn to="/sujets/nouveau" color="secondary" size="x-large" prepend-icon="mdi-plus">
        {{ $t('create a subject') }}
      </v-btn>
    </section>

    <section class="my-subjects-page__content">
      <template v-if="subjects.length > 0">
        <nav :aria-label="$t('filter by status')" class="my-subjects-page__filters">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            type="button"
            :aria-pressed="filter === option.value"
            :class="[
              'cinq-tab',
              'my-subjects-page__filter',
              { 'cinq-tab--active': filter === option.value },
            ]"
            @click="filter = option.value"
          >
            {{ option.label }} · {{ counts[option.value] }}
          </button>
        </nav>
        <p v-if="shownSubjects.length === 0">{{ $t('no subject in this filter.') }}</p>
        <MySubjectRow
          v-for="subject in shownSubjects"
          :key="subject.id"
          :subject
          @publish="publishSubject"
          @unpublish="unpublishSubject"
          @delete="askToDelete"
        />
      </template>

      <div v-else class="my-subjects-page__empty">
        <h2 class="my-subjects-page__empty-title">{{ $t('no subject yet') }}</h2>
        <p>
          {{
            $t(
              'create your first subject: it stays a draft, only you can see it, until you publish it.',
            )
          }}
        </p>
        <v-btn to="/sujets/nouveau" color="primary" size="x-large" prepend-icon="mdi-plus">
          {{ $t('create a subject') }}
        </v-btn>
      </div>
    </section>

    <ConfirmDialog
      :open="dialog?.kind === 'no-question'"
      :title="$t('cannot publish')"
      :cancel-label="$t('close')"
      :confirm-label="$t('add questions')"
      @close="closeDialog"
      @confirm="navigateTo(`/sujets/${dialog?.subject.id}/modifier`)"
    >
      {{
        $t('“{title}” has no question. add at least one before publishing it.', {
          title: dialog?.subject.title,
        })
      }}
    </ConfirmDialog>
    <ConfirmDialog
      :open="dialog?.kind === 'delete'"
      :title="$t('delete this subject?')"
      :confirm-label="$t('delete for good')"
      danger
      @close="closeDialog"
      @confirm="confirmDelete"
    >
      {{
        $t('“{title}” and its {count} questions will be deleted for good. this cannot be undone.', {
          title: dialog?.subject.title,
          count: dialog?.subject.questions_count ?? 0,
        })
      }}
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const {
  subjects,
  shownSubjects,
  counts,
  filter,
  dialog,
  publishSubject,
  unpublishSubject,
  askToDelete,
  confirmDelete,
  closeDialog,
} = await useMySubjects()

const filterOptions = computed<{ value: SubjectFilter; label: string }[]>(() => [
  { value: 'all', label: t('all subjects filter') },
  { value: 'draft', label: t('drafts') },
  { value: 'published', label: t('published plural') },
  { value: 'retired', label: t('retired plural') },
])

useHead({ title: () => t('my subjects') })
</script>

<style scoped lang="scss">
.my-subjects-page {
  &__hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 4rem) 2rem;
    border-bottom: var(--cinq-border);
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0.5rem 0 0;
    font-size: clamp(2.75rem, 9vw, 6.5rem);
    line-height: 0.86;
    text-transform: uppercase;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 2.5rem clamp(1rem, 5vw, 4rem);
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 2rem;
    margin-bottom: 0.75rem;
  }

  &__filter {
    border-top: 0;
    border-right: 0;
    border-left: 0;
    background: none;
    color: var(--cinq-ink);
    font-family: var(--cinq-font-body);
    font-size: 1.0625rem;
    font-weight: 700;
    cursor: pointer;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
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
}
</style>
