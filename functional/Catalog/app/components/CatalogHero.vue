<template>
  <section class="catalog-hero">
    <div class="catalog-hero__top">
      <div class="catalog-hero__heading">
        <div class="catalog-hero__eyebrow">{{ eyebrow }}</div>
        <h1 class="catalog-hero__title">{{ title }}</h1>
      </div>
      <div class="catalog-hero__search">
        <SubjectSearchForm :target-path :initial-text="searchText" />
      </div>
    </div>
    <CategoryChips :categories :active-id="activeId" />
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  targetPath: { type: String, required: true },
  searchText: { type: String, default: '' },
  categories: { type: Array as PropType<Category[]>, required: true },
  activeId: { type: Number, default: undefined },
})
</script>

<style scoped lang="scss">
.catalog-hero {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 4rem) 2.5rem;
  border-bottom: var(--cinq-border);

  &__top {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem 2.5rem;
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.75rem, 10vw, 7.5rem);
    line-height: 0.85;
    text-transform: uppercase;
  }

  &__search {
    flex: 0 1 38.75rem;
    min-width: min(100%, 18rem);
  }
}
</style>
