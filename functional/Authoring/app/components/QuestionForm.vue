<template>
  <section class="question-form" :aria-label="heading">
    <div class="question-form__heading">{{ heading }}</div>
    <div class="question-form__faces">
      <div class="question-form__face">
        <span class="question-form__label">{{ $t('recto · question') }}</span>
        <QuestionImagesField :images />
        <RichTextEditor
          v-model="recto"
          :label="$t('recto')"
          :invalid="(isEmpty || isRectoEmpty) && !recto"
        />
      </div>
      <div class="question-form__face">
        <span class="question-form__label">{{ $t('verso · answer') }}</span>
        <RichTextEditor v-model="verso" :label="$t('verso')" :invalid="isEmpty && !verso" />
      </div>
    </div>
    <p v-if="isEmpty" role="alert" class="question-form__error">
      <strong>{{ $t('the recto and the verso are required.') }}</strong>
      {{ $t('each can hold up to 5,000 characters.') }}
    </p>
    <p v-if="isRectoEmpty" role="alert" class="question-form__error">
      <strong>{{ $t('add a text or an image to the recto.') }}</strong>
    </p>
    <p v-if="isUploading" class="question-form__notice">
      {{ $t('wait until the images are uploaded.') }}
    </p>
    <p v-if="failed" role="alert" class="question-form__error">
      <strong>{{ $t('the question could not be saved.') }}</strong>
      {{ $t('what you typed is kept. check your connection, then try again.') }}
    </p>
    <div class="question-form__actions">
      <v-btn variant="outlined" size="large" @click="emit('cancel')">{{ $t('cancel') }}</v-btn>
      <v-btn
        color="primary"
        size="large"
        :loading="isSaving"
        :disabled="isUploading"
        @click="emit('save')"
      >
        {{ failed ? $t('try again') : $t('save the question') }}
      </v-btn>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const recto = defineModel<string>('recto', { required: true })
const verso = defineModel<string>('verso', { required: true })

defineProps({
  heading: { type: String, required: true },
  images: { type: Object as PropType<ReturnType<typeof useQuestionImages>>, required: true },
  isEmpty: { type: Boolean, default: false },
  isRectoEmpty: { type: Boolean, default: false },
  isUploading: { type: Boolean, default: false },
  failed: { type: Boolean, default: false },
  isSaving: { type: Boolean, default: false },
})
const emit = defineEmits(['cancel', 'save'])
</script>

<style scoped lang="scss">
.question-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: var(--cinq-border);
  background: var(--cinq-cream);
  box-shadow: 6px 6px 0 var(--cinq-blue);

  &__heading,
  &__label {
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__faces {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 1rem;
  }

  &__face {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  &__error {
    margin: 0;
    padding: 0.75rem 1rem;
    border: 4px solid var(--cinq-red);
    background: var(--cinq-white);
  }

  &__notice {
    margin: 0;
    font-weight: 700;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.75rem;
  }
}
</style>
