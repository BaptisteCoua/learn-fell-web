<template>
  <div class="question-import">
    <section class="question-import__hero">
      <NuxtLink
        :to="`/sujets/${subject.id}/modifier`"
        class="question-import__back cinq-standalone-link"
        ><v-icon icon="mdi-arrow-left" /> {{ $t('back to the subject') }}</NuxtLink
      >
      <h1 class="question-import__title">{{ $t('import questions') }}</h1>
      <p class="question-import__subject">{{ subject.title }}</p>
    </section>

    <div class="question-import__body">
      <QuestionImportSource
        v-if="phase === 'source'"
        v-model:kind="sourceKind"
        v-model:text="text"
        :template-url="templateUrl"
        :is-reading="isReading"
        :error="sourceError"
        @file="previewFile"
        @text="previewText"
      />
      <QuestionImportPreview
        v-else-if="preview"
        :preview
        :has-learners="hasLearners"
        :is-importing="phase === 'importing'"
        :error="importError"
        @confirm="confirm"
        @back="backToSource"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const {
  subject,
  hasLearners,
  phase,
  sourceKind,
  text,
  preview,
  sourceError,
  importError,
  isReading,
  templateUrl,
  previewFile,
  previewText,
  confirm,
  backToSource,
} = await useQuestionImport(Number(route.params.id))

useHead({ title: () => `${t('import questions')} · ${subject.title}` })
</script>

<style scoped lang="scss">
.question-import {
  &__hero {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem clamp(1rem, 5vw, 4rem);
    border-bottom: var(--cinq-border);
  }

  &__back {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 0.5rem;
    font-weight: 700;
  }

  &__title {
    margin: 0;
    font-size: clamp(1.75rem, 5vw, 3rem);
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  &__subject {
    margin: 0;
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 72rem;
    padding: 2rem clamp(1rem, 5vw, 4rem) 3rem;
  }
}
</style>
