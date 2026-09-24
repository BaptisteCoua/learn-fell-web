<template>
  <div v-if="category">
    <CatalogHero
      :eyebrow="$t('catalogue / category')"
      :title="category.name"
      :target-path="`/categories/${category.id}`"
      :search-text="searchText"
      :categories
      :active-id="category.id"
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
const route = useRoute()
const { categories, category, searchText, subjects, total, page, lastPage, goToPage } =
  await useCatalogPage(Number(route.params.id))

const summary = computed(() =>
  searchText
    ? t('for “{text}” in {category}', { text: searchText, category: category.value?.name })
    : t('in {category}', { category: category.value?.name }),
)

useHead({ title: () => category.value?.name ?? t('catalogue') })
</script>
