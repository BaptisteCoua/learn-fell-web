<template>
  <nav :aria-label="$t('categories')" class="category-chips">
    <NuxtLink
      v-if="withAll"
      to="/categories"
      :aria-current="activeId === undefined ? 'true' : undefined"
      :class="['category-chips__chip', { 'category-chips__chip--active': activeId === undefined }]"
    >
      {{ $t('all') }}
    </NuxtLink>
    <NuxtLink
      v-for="category in categories"
      :key="category.id"
      :to="`/categories/${category.id}`"
      :aria-current="category.id === activeId ? 'true' : undefined"
      :class="[
        'category-chips__chip',
        { 'category-chips__chip--active': category.id === activeId },
      ]"
    >
      {{ category.name
      }}<template v-if="showCounts"> · {{ category.subjects_count ?? 0 }}</template>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  categories: { type: Array as PropType<Category[]>, required: true },
  activeId: { type: Number, default: undefined },
  showCounts: { type: Boolean, default: true },
  withAll: { type: Boolean, default: true },
})
</script>

<style scoped lang="scss">
.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  &__chip {
    padding: 0.75rem 1.25rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-white);
    font-size: 1.0625rem;
    font-weight: 700;
    text-decoration: none;

    &--active {
      background: var(--cinq-ink);
      color: var(--cinq-cream);

      &:hover {
        color: var(--cinq-cream);
      }
    }
  }
}
</style>
