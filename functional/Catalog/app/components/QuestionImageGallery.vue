<template>
  <div
    v-if="items.length > 0"
    :class="['question-image-gallery', `question-image-gallery--${layout}`]"
  >
    <template v-for="{ image, sources } in items" :key="image.id">
      <div
        v-if="isFailed(image.id)"
        class="question-image-gallery__fallback"
        :style="{ aspectRatio: `${sources.width} / ${sources.height}` }"
      >
        {{ $t('image not loaded: {alt}', { alt: image.alt ?? '' }) }}
      </div>
      <button
        v-else
        type="button"
        class="question-image-gallery__item"
        :aria-label="$t('enlarge the image: {alt}', { alt: image.alt ?? '' })"
        @click="open(image, $event.currentTarget)"
      >
        <img
          :src="sources.src"
          :srcset="sources.srcset"
          :sizes
          :width="sources.width"
          :height="sources.height"
          :alt="image.alt ?? ''"
          crossorigin="use-credentials"
          :loading="eager ? 'eager' : 'lazy'"
          class="question-image-gallery__image"
          @error="markFailed(image.id)"
        />
      </button>
    </template>
    <QuestionImageViewer
      v-model="isOpen"
      :image="viewedImage"
      :src="viewedImageSrc"
      @close="close"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IGalleryImage } from '../composables/useQuestionImageViewer'

// An array, or the `images` relation of a question as raom holds it.
const props = defineProps({
  images: { type: [Array, Object] as PropType<Iterable<IGalleryImage>>, required: true },
  eager: { type: Boolean, default: false },
})

const {
  items,
  layout,
  sizes,
  isFailed,
  markFailed,
  viewedImage,
  viewedImageSrc,
  isOpen,
  open,
  close,
} = useQuestionImageGallery(() => props.images)
</script>

<style scoped lang="scss">
.question-image-gallery {
  display: grid;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;

  &--single {
    grid-template-columns: minmax(0, 37.5rem);
  }

  &--grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    max-width: 37.5rem;
  }

  &__item {
    display: block;
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-cream);
    cursor: zoom-in;

    &:focus-visible {
      outline: 4px solid var(--cinq-blue);
      outline-offset: 2px;
    }
  }

  &__image {
    display: block;
    width: 100%;
    height: auto;
  }

  &__fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0.75rem;
    border: 3px dashed var(--cinq-ink);
    background: var(--cinq-cream);
    font-size: 0.9375rem;
    overflow-wrap: anywhere;
  }
}
</style>
