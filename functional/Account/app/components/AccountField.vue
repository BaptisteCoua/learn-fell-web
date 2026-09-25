<template>
  <div class="account-field">
    <div class="account-field__header">
      <label :for="inputId" class="account-field__label">{{ label }}</label>
      <slot name="aside" />
    </div>
    <v-text-field
      :id="inputId"
      v-model="model"
      :type
      :autocomplete
      :error-messages="error ? [error] : []"
      :hint="help"
      persistent-hint
      hide-details="auto"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: 'off' },
  help: { type: String, default: '' },
  error: { type: String, default: '' },
})

const inputId = useId()
</script>

<style scoped lang="scss">
.account-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__label {
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;
  }
}
</style>
