<template>
  <ul v-if="sortedImages.length > 0" class="offline-image-notice">
    <li v-for="image in sortedImages" :key="image.position" class="offline-image-notice__item">
      <span class="offline-image-notice__label">{{ $t('image not available offline') }}</span>
      <span>{{ image.alt }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  images: { type: Array as PropType<{ alt: string; position: number }[]>, required: true },
})

const sortedImages = computed(() =>
  [...props.images].sort((first, second) => first.position - second.position),
)
</script>

<style scoped lang="scss">
.offline-image-notice {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    border: 3px dashed var(--cinq-ink);
    font-size: 1rem;
  }

  &__label {
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
  }
}
</style>
