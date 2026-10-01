<template>
  <li class="question-image-row">
    <div class="question-image-row__preview">
      <img
        v-if="previewSrc"
        :src="previewSrc"
        :alt="entry.alt"
        crossorigin="use-credentials"
        class="question-image-row__image"
      />
    </div>

    <div class="question-image-row__body">
      <span class="question-image-row__label">{{ $t('image {n}', { n: number }) }}</span>

      <template v-if="entry.status === 'uploading'">
        <v-progress-linear
          :model-value="entry.progress"
          color="primary"
          height="12"
          :aria-label="$t('uploading image {n}', { n: number })"
        />
        <v-btn variant="outlined" size="large" @click="emit('cancel')">
          {{ $t('cancel the upload') }}
        </v-btn>
      </template>

      <div v-else-if="entry.status === 'failed'" role="alert" class="question-image-row__error">
        <strong>{{ $t('the image could not be uploaded.') }}</strong>
        <span v-if="entry.errorMessage">{{ entry.errorMessage }}</span>
        <v-btn color="primary" size="large" @click="emit('retry')">{{ $t('try again') }}</v-btn>
      </div>

      <v-textarea
        v-else
        :model-value="entry.alt"
        :label="$t('image description')"
        :counter="MAX_ALT_LENGTH"
        :maxlength="MAX_ALT_LENGTH"
        :error-messages="hasAltError ? $t('describe this image.') : undefined"
        rows="2"
        auto-grow
        @update:model-value="emit('update:alt', $event)"
      />

      <div class="question-image-row__tools">
        <v-btn
          icon="mdi-arrow-up"
          variant="outlined"
          :disabled="index === 0"
          :aria-label="$t('move image {n} up', { n: number })"
          @click="emit('move', -1)"
        />
        <v-btn
          icon="mdi-arrow-down"
          variant="outlined"
          :disabled="index === count - 1"
          :aria-label="$t('move image {n} down', { n: number })"
          @click="emit('move', 1)"
        />
        <v-btn
          variant="outlined"
          :disabled="isOffline"
          :aria-label="$t('replace image {n}', { n: number })"
          @click="open"
        >
          {{ $t('replace') }}
        </v-btn>
        <input
          ref="input"
          type="file"
          :accept
          hidden
          class="question-image-row__input"
          @change="onChange"
        />
        <v-btn
          variant="outlined"
          :aria-label="$t('remove image {n}', { n: number })"
          @click="emit('remove')"
        >
          {{ $t('remove') }}
        </v-btn>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IQuestionImageEntry } from '../composables/useQuestionImages'

const props = defineProps({
  entry: { type: Object as PropType<IQuestionImageEntry>, required: true },
  index: { type: Number, required: true },
  count: { type: Number, required: true },
  isAltRequired: { type: Boolean, default: false },
  isOffline: { type: Boolean, default: false },
})
const emit = defineEmits<{
  'update:alt': [string]
  move: [-1 | 1]
  replace: [File]
  remove: []
  cancel: []
  retry: []
}>()

const { input, open, onChange, accept } = useFilePicker(([file]) => {
  if (file) {
    emit('replace', file)
  }
}, ACCEPTED_IMAGE_TYPES.join(','))
const { number, hasAltError, previewSrc } = useQuestionImageRow(props)
</script>

<style scoped lang="scss">
.question-image-row {
  display: grid;
  grid-template-columns: minmax(0, 8rem) minmax(0, 1fr);
  gap: 1rem;
  padding: 0.75rem;
  border: 3px solid var(--cinq-ink);
  background: var(--cinq-white);

  &__preview {
    min-height: 4rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-cream);
  }

  &__image {
    display: block;
    width: 100%;
    height: auto;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  &__label {
    font-family: var(--cinq-font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 4px solid var(--cinq-red);
  }

  &__tools {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;

    :deep(.v-btn) {
      min-width: 44px;
      min-height: 44px;
    }
  }

  @media (max-width: 599px) {
    grid-template-columns: minmax(0, 1fr);

    &__preview {
      max-width: 12rem;
    }
  }
}
</style>
