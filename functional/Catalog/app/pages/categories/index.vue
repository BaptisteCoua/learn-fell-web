<template>
  <div>
    <CatalogHero
      :eyebrow="$t('catalogue')"
      :title="$t('all subjects')"
      target-path="/categories"
      :search-text="searchText"
      :categories
    />
    <SubjectListing
      :subjects
      :total
      :page
      :last-page="lastPage"
      :summary="summary"
      :query="searchText"
      @page="goToPage"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ key: (route) => route.fullPath })

const { t } = useI18n()
const { categories, searchText, subjects, total, page, lastPage, goToPage } = await useCatalogPage()

const summary = computed(() =>
  searchText ? t('for “{text}”, all categories', { text: searchText }) : t('all categories'),
)

useHead({ title: () => t('catalogue') })
</script>
