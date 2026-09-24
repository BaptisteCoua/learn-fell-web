<template>
  <section class="subject-listing">
    <div class="subject-listing__summary">
      <p class="subject-listing__count">
        <strong>{{ $t('{count} subjects | {count} subject | {count} subjects', total) }}</strong>
        <template v-if="summary">{{ ' ' }}{{ summary }}</template>
      </p>
      <span class="subject-listing__sort">{{ $t('sort: most recent') }}</span>
    </div>
    <SubjectGrid :subjects :query />
    <v-pagination
      v-if="lastPage > 1"
      :model-value="page"
      :length="lastPage"
      :total-visible="5"
      :aria-label="$t('pagination')"
      @update:model-value="emit('page', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  subjects: { type: Array as PropType<Subject[]>, required: true },
  total: { type: Number, required: true },
  page: { type: Number, required: true },
  lastPage: { type: Number, required: true },
  summary: { type: String, default: '' },
  query: { type: String, default: '' },
})
const emit = defineEmits(['page'])
</script>

<style scoped lang="scss">
.subject-listing {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem clamp(1rem, 5vw, 4rem);

  &__summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    font-size: 1.125rem;
  }

  &__count {
    margin: 0;
  }

  &__sort {
    font-family: var(--cinq-font-mono);
    font-size: 0.9375rem;
    font-weight: 600;
    text-transform: uppercase;
  }
}
</style>
