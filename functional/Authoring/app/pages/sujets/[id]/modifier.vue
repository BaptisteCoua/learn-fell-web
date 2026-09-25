<template>
  <div class="subject-editor">
    <section class="subject-editor__hero">
      <NuxtLink to="/mes-sujets" class="subject-editor__back cinq-standalone-link"
        ><v-icon icon="mdi-arrow-left" /> {{ $t('my subjects') }}</NuxtLink
      >
      <div class="subject-editor__status">
        <SubjectStatusBadge :status />
        <span>{{ statusText }}</span>
      </div>
      <SubjectModerationPanel
        v-if="isModerating"
        :subject-id="subject.id"
        :title="subject.title"
        :status
        :with-edit="false"
        @status="setStatus"
      />
      <div v-else class="subject-editor__actions">
        <template v-if="status === 'draft'">
          <v-btn variant="outlined" size="large" @click="openDialog('delete-subject')">{{
            $t('delete the subject')
          }}</v-btn>
          <v-btn color="primary" size="large" @click="publishSubject">{{
            $t('publish the subject')
          }}</v-btn>
        </template>
        <template v-else-if="status === 'published'">
          <v-btn :to="`/sujets/${subject.id}`" variant="outlined" size="large">{{
            $t('view the public page')
          }}</v-btn>
          <v-btn color="secondary" size="large" @click="unpublishSubject">{{
            $t('unpublish')
          }}</v-btn>
        </template>
        <v-btn v-else variant="outlined" size="large" @click="openDialog('delete-subject')">{{
          $t('delete the subject')
        }}</v-btn>
      </div>
    </section>

    <AccountNotice
      v-if="isModerating"
      tone="info"
      :title="
        $t('administrator mode: you are editing the subject of {name}.', {
          name: subject.author.display_name,
        })
      "
      :text="$t('your changes are visible to everyone if the subject is published.')"
      class="subject-editor__retired"
    />
    <AccountNotice
      v-if="isReadOnly"
      tone="error"
      :title="$t('subject retired by the moderation.')"
      :text="`${$t('reason: “{reason}”', { reason: subject.retired_reason ?? '' })} ${$t('you cannot publish it again: only an administrator can restore it.')}`"
      class="subject-editor__retired"
    />

    <div class="subject-editor__details-band">
      <form class="subject-editor__details" @submit.prevent="saveDetails">
        <SubjectFieldsForm
          v-model:title="form.title.value"
          v-model:category-id="form.categoryId.value"
          v-model:tag-names="form.tagNames.value"
          v-model:description="form.description.value"
          :categories
          :errors="form.fieldErrors.value"
          :disabled="isReadOnly"
        />
        <div v-if="!isReadOnly" class="subject-editor__save">
          <v-btn type="submit" color="primary" size="large" :loading="form.isSaving.value">{{
            $t('save the details')
          }}</v-btn>
        </div>
      </form>
    </div>

    <section class="subject-editor__questions">
      <div class="subject-editor__questions-header">
        <h2 class="subject-editor__questions-title">
          {{ $t('questions · {count}', { count: questions.length }) }}
        </h2>
        <span v-if="!isReadOnly">{{
          $t('reorder them with the arrows. each question is a review card.')
        }}</span>
      </div>

      <template v-for="(question, index) in questions" :key="question.id">
        <QuestionForm
          v-if="draft.target.value === question.id"
          v-model:recto="draft.recto.value"
          v-model:verso="draft.verso.value"
          :heading="$t('question {number} — being edited', { number: index + 1 })"
          :is-empty="draft.isEmpty.value"
          :failed="draft.failed.value"
          :is-saving="draft.isSaving.value"
          @cancel="draft.cancel"
          @save="saveQuestion(question)"
        />
        <QuestionCard
          v-else
          :question
          :index
          :is-first="index === 0"
          :is-last="index === questions.length - 1"
          :editable="!isReadOnly"
          @move="(step) => move(index, step)"
          @edit="draft.start(question.id, question)"
          @delete="askToDeleteQuestion(question)"
        />
      </template>

      <div
        v-if="questions.length === 0 && draft.target.value !== 'new'"
        class="subject-editor__empty"
      >
        <strong>{{ $t('no question') }}</strong>
        <span>{{ $t('add at least one question to be able to publish this subject.') }}</span>
      </div>

      <QuestionForm
        v-if="draft.target.value === 'new'"
        v-model:recto="draft.recto.value"
        v-model:verso="draft.verso.value"
        :heading="$t('new question')"
        :is-empty="draft.isEmpty.value"
        :failed="draft.failed.value"
        :is-saving="draft.isSaving.value"
        @cancel="draft.cancel"
        @save="saveQuestion()"
      />
      <v-btn
        v-else-if="!isReadOnly"
        variant="outlined"
        size="x-large"
        prepend-icon="mdi-plus"
        class="subject-editor__add"
        @click="addQuestion"
      >
        {{ $t('add a question') }}
      </v-btn>
    </section>

    <ConfirmDialog
      :open="dialog === 'no-question'"
      :title="$t('cannot publish')"
      :cancel-label="$t('close')"
      :confirm-label="$t('add a question')"
      @close="closeDialog"
      @confirm="addQuestion"
    >
      {{ $t('this subject has no question. add at least one before publishing it.') }}
    </ConfirmDialog>
    <ConfirmDialog
      :open="dialog === 'delete-subject'"
      :title="$t('delete this subject?')"
      :confirm-label="$t('delete for good')"
      danger
      @close="closeDialog"
      @confirm="confirmDeleteSubject"
    >
      {{
        $t('“{title}” and its {count} questions will be deleted for good. this cannot be undone.', {
          title: subject.title,
          count: questions.length,
        })
      }}
    </ConfirmDialog>
    <ConfirmDialog
      :open="dialog === 'delete-question'"
      :title="$t('delete this question?')"
      :confirm-label="$t('delete the question')"
      danger
      @close="closeDialog"
      @confirm="confirmDeleteQuestion"
    >
      <RichTextView v-if="questionToDelete" :html="questionToDelete.recto_html" />
      {{ $t('this cannot be undone.') }}
    </ConfirmDialog>
    <ConfirmDialog
      :open="dialog === 'last-question'"
      :title="$t('last question')"
      :cancel-label="$t('close')"
      :confirm-label="$t('unpublish the subject')"
      @close="closeDialog"
      @confirm="unpublishSubject"
    >
      {{
        $t(
          'a published subject must keep at least one question. unpublish it first to delete this one.',
        )
      }}
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const {
  subject,
  questions,
  categories,
  status,
  isModerating,
  isReadOnly,
  form,
  draft,
  dialog,
  questionToDelete,
  saveDetails,
  saveQuestion,
  move,
  addQuestion,
  askToDeleteQuestion,
  confirmDeleteQuestion,
  publishSubject,
  unpublishSubject,
  confirmDeleteSubject,
  setStatus,
  openDialog,
  closeDialog,
} = await useSubjectEditor(Number(route.params.id))

const statusText = computed(
  () =>
    ({
      draft: t('only you can see it'),
      published: t('everyone can see it'),
      retired: t('not visible to the public'),
    })[status.value],
)

useHead({ title: () => subject.title })
</script>

<style scoped lang="scss">
.subject-editor {
  &__hero {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 2rem;
    padding: 1.5rem clamp(1rem, 5vw, 4rem);
    border-bottom: var(--cinq-border);
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
  }

  &__status {
    display: flex;
    flex-grow: 1;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  &__retired {
    margin: 1.5rem clamp(1rem, 5vw, 4rem) 0;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 64rem;
    padding: 2rem clamp(1rem, 5vw, 4rem);
  }

  &__details-band {
    border-bottom: var(--cinq-border);
  }

  &__save {
    display: flex;
    justify-content: flex-end;
  }

  &__questions {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 2rem clamp(1rem, 5vw, 4rem) 3rem;
  }

  &__questions-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem 1rem;
  }

  &__questions-title {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    text-transform: uppercase;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.5rem;
    border: 4px dashed var(--cinq-ink);
    background: var(--cinq-white);
  }

  &__add {
    align-self: flex-start;
  }
}
</style>
