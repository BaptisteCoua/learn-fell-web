<template>
  <div class="subject-fields-form">
    <div class="subject-fields-form__field">
      <label :for="titleId" class="subject-fields-form__label">{{ $t('title') }}</label>
      <v-text-field
        :id="titleId"
        v-model="title"
        :disabled
        :error-messages="errors.title ? [errors.title] : []"
        :hint="$t('between 3 and 120 characters.')"
        persistent-hint
        hide-details="auto"
      />
    </div>
    <div class="subject-fields-form__row">
      <div class="subject-fields-form__field">
        <label :for="categoryId" class="subject-fields-form__label">{{ $t('category') }}</label>
        <v-select
          :id="categoryId"
          v-model="category"
          :items="categories"
          item-title="name"
          item-value="id"
          :disabled
          :placeholder="$t('choose a category')"
          :error-messages="errors.category_id ? [errors.category_id] : []"
          hide-details="auto"
        />
      </div>
      <div class="subject-fields-form__field">
        <label :for="tagsId" class="subject-fields-form__label">
          {{ $t('tags (optional)') }}
          <span class="subject-fields-form__count">({{ tags.length }} / 10)</span>
        </label>
        <TagInput v-model="tags" :input-id="tagsId" :disabled />
      </div>
    </div>
    <div class="subject-fields-form__field">
      <label :for="descriptionId" class="subject-fields-form__label">{{ $t('description') }}</label>
      <v-textarea
        :id="descriptionId"
        v-model="description"
        :disabled
        rows="4"
        auto-grow
        :error-messages="errors.description ? [errors.description] : []"
        :hint="$t('2,000 characters at most. it shows in the catalogue and the search results.')"
        persistent-hint
        hide-details="auto"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const title = defineModel<string>('title', { required: true })
const category = defineModel<number | null>('categoryId', { required: true })
const tags = defineModel<string[]>('tagNames', { required: true })
const description = defineModel<string>('description', { required: true })

defineProps({
  categories: { type: Array as PropType<Category[]>, required: true },
  errors: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
  disabled: { type: Boolean, default: false },
})

const titleId = useId()
const categoryId = useId()
const tagsId = useId()
const descriptionId = useId()
</script>

<style scoped lang="scss">
.subject-fields-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;

  &__row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    // Each field keeps its own height: a hint under one must not stretch its neighbour.
    align-items: start;
    gap: 1.5rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  &__label {
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;
  }

  &__count {
    font-weight: 500;
    letter-spacing: 0;
  }
}
</style>
