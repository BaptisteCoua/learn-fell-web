<template>
  <div>
    <section class="search-page__hero">
      <div class="search-page__eyebrow">{{ $t('catalogue / search') }}</div>
      <SubjectSearchForm target-path="/recherche" :initial-text="searchText" size="large" />
    </section>

    <SubjectListing
      v-if="state === 'results'"
      :subjects
      :total
      :page
      :last-page="lastPage"
      :summary="$t('for “{text}”, all categories', { text: searchText })"
      :query="searchText"
      @page="goToPage"
    />

    <section v-else class="search-page__content">
      <div v-if="state === 'empty'" class="search-page__empty">
        <h2 class="search-page__empty-title">{{ $t('no results') }}</h2>
        <p class="search-page__empty-text">
          {{
            $t(
              'no published subject matches “{text}”. try a shorter word, check the spelling, or browse the categories.',
              { text: searchText },
            )
          }}
        </p>
        <CategoryChips :categories :show-counts="false" :with-all="false" />
        <v-btn to="/sujets/nouveau" color="primary" prepend-icon="mdi-plus">
          {{ $t('create this subject') }}
        </v-btn>
      </div>

      <v-alert v-else type="info" variant="outlined" class="search-page__short">
        <strong>{{ $t('type at least 2 characters to search.') }}</strong>
        {{ $t('the search covers the title, the description and the tags of published subjects.') }}
      </v-alert>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ key: (route) => route.fullPath })

const { t } = useI18n()
const { state, searchText, categories, subjects, total, page, lastPage, goToPage } =
  await useSearchPage()

useHead({ title: () => t('search') })
</script>

<style scoped lang="scss">
.search-page {
  &__hero {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 4rem) 2.5rem;
    border-bottom: var(--cinq-border);
  }

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__content {
    padding: 2.5rem clamp(1rem, 5vw, 4rem);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.375rem;
    padding: clamp(1.5rem, 5vw, 3.5rem);
    border: 4px dashed var(--cinq-ink);
    background: var(--cinq-white);
  }

  &__empty-title {
    margin: 0;
    font-size: var(--cinq-text-h2);
    text-transform: uppercase;
  }

  &__empty-text {
    max-width: 47.5rem;
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.5;
  }

  &__short {
    border-width: 4px;
    font-size: 1.125rem;
  }
}
</style>
