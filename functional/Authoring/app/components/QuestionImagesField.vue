<template>
  <div class="question-images-field">
    <div class="question-images-field__header">
      <v-btn
        variant="outlined"
        size="large"
        prepend-icon="mdi-image-plus"
        :disabled="!canAdd || isOffline"
        @click="open"
      >
        {{ $t('add an image') }}
      </v-btn>
      <input
        ref="input"
        type="file"
        :accept
        multiple
        hidden
        class="question-images-field__input"
        @change="onChange"
      />
      <span class="question-images-field__help">{{
        $t('accepted formats: jpeg, png or webp, 5 mb at most, 4 images per recto.')
      }}</span>
    </div>

    <p v-if="rejectionMessage" role="alert" class="question-images-field__error">
      {{ rejectionMessage }}
    </p>

    <ol v-if="entries.length > 0" class="question-images-field__list">
      <QuestionImageRow
        v-for="(entry, index) in entries"
        :key="entry.key"
        :entry
        :index
        :count="entries.length"
        :is-alt-required="isAltRequired"
        :is-offline="isOffline"
        @update:alt="(alt) => setAlt(index, alt)"
        @move="(step) => move(index, step)"
        @replace="(file) => replace(index, file)"
        @remove="remove(index)"
        @cancel="cancel(index)"
        @retry="retry(index)"
      />
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  images: { type: Object as PropType<ReturnType<typeof useQuestionImages>>, required: true },
})

const {
  entries,
  rejectionMessage,
  isAltRequired,
  canAdd,
  add,
  replace,
  remove,
  cancel,
  retry,
  move,
  setAlt,
} = props.images
const { isOffline } = useConnectionStatus()
const { input, open, onChange, accept } = useFilePicker(add, ACCEPTED_IMAGE_TYPES.join(','))
</script>

<style scoped lang="scss">
.question-images-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1rem;
  }

  &__help {
    font-size: 0.875rem;
  }

  &__error {
    margin: 0;
    padding: 0.75rem 1rem;
    border: 4px solid var(--cinq-red);
    background: var(--cinq-white);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
}
</style>
