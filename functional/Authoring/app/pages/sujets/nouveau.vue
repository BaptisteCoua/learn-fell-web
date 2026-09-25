<template>
  <div class="new-subject-page">
    <section class="new-subject-page__hero">
      <NuxtLink to="/mes-sujets" class="new-subject-page__back">
        <v-icon icon="mdi-arrow-left" /> {{ $t('my subjects') }}
      </NuxtLink>
      <h1 class="new-subject-page__title">{{ $t('new subject') }}</h1>
    </section>

    <form class="new-subject-page__form" @submit.prevent="submit">
      <AccountNotice
        v-if="failed && errorCount > 0"
        tone="error"
        :title="$t('the subject could not be created.')"
        :text="$t('fix the {count} fields shown below.', { count: errorCount })"
      />
      <SubjectFieldsForm
        v-model:title="title"
        v-model:category-id="categoryId"
        v-model:tag-names="tagNames"
        v-model:description="description"
        :categories
        :errors="fieldErrors"
      />
      <AccountNotice
        tone="info"
        :title="$t('your subject will be created as a draft.')"
        :text="$t('only you can see it. add questions, then publish it when it is ready.')"
      />
      <div class="new-subject-page__actions">
        <v-btn to="/mes-sujets" variant="outlined" size="x-large">{{ $t('cancel') }}</v-btn>
        <v-btn type="submit" color="primary" size="x-large" :loading="isSaving">{{
          $t('create the draft')
        }}</v-btn>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const {
  categories,
  title,
  categoryId,
  tagNames,
  description,
  fieldErrors,
  errorCount,
  isSaving,
  failed,
  submit,
} = await useNewSubjectForm()

useHead({ title: () => t('new subject') })
</script>

<style scoped lang="scss">
.new-subject-page {
  &__hero {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: clamp(2rem, 5vw, 3rem) clamp(1rem, 5vw, 4rem) 2rem;
    border-bottom: var(--cinq-border);
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.5rem, 8vw, 6.5rem);
    line-height: 0.86;
    text-transform: uppercase;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    max-width: 56rem;
    padding: 2.5rem clamp(1rem, 5vw, 4rem);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 1rem;
  }
}
</style>
