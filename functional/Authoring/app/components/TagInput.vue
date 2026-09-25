<template>
  <v-combobox
    :id="inputId"
    v-model="model"
    :items="suggestions"
    :disabled
    :error-messages="error ? [error] : []"
    :hint="$t('up to 10 tags. press enter to add one.')"
    :rules="[tagCount]"
    :placeholder="$t('e.g. grammar, verbs')"
    multiple
    chips
    closable-chips
    persistent-hint
    hide-details="auto"
    @update:search="search"
  />
</template>

<script setup lang="ts">
const model = defineModel<string[]>({ required: true })

defineProps({
  inputId: { type: String, required: true },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const { suggestions, search } = useTagSuggestions()
const { maxItems } = useValidationRules()
const tagCount = maxItems(10)
</script>
