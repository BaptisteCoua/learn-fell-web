<template>
  <v-dialog
    v-model="isOpen"
    fullscreen
    :content-props="{ 'aria-label': image?.alt ?? '' }"
    content-class="question-image-viewer"
  >
    <figure v-if="image && src" class="question-image-viewer__figure">
      <div class="question-image-viewer__bar">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-close"
          class="question-image-viewer__close"
          @click="emit('close')"
        >
          {{ $t('close') }}
        </v-btn>
      </div>
      <img
        :src
        :alt="image.alt ?? ''"
        crossorigin="use-credentials"
        class="question-image-viewer__image"
        @click="emit('close')"
      />
      <figcaption class="question-image-viewer__caption">{{ image.alt }}</figcaption>
    </figure>
  </v-dialog>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IGalleryImage } from '../composables/useQuestionImageViewer'

const isOpen = defineModel<boolean>({ required: true })

defineProps({
  image: { type: Object as PropType<IGalleryImage | null>, default: null },
  src: { type: String as PropType<string | null>, default: null },
})
const emit = defineEmits<{ close: [] }>()
</script>

<style scoped lang="scss">
.question-image-viewer {
  &__figure {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    margin: 0;
    padding: 1rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
  }

  &__bar {
    display: flex;
    justify-content: flex-end;
  }

  &__close {
    min-width: 44px;
    min-height: 44px;
  }

  &__image {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    object-fit: contain;
    cursor: zoom-out;
  }

  &__caption {
    max-width: 45rem;
    margin: 0 auto;
    font-size: 1rem;
    line-height: 1.4;
    text-align: center;
  }
}
</style>
