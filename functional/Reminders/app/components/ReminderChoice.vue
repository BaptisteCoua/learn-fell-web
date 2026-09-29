<template>
  <label class="reminder-choice">
    <input
      :name
      type="checkbox"
      class="reminder-choice__box"
      :checked="model"
      :disabled
      @change="model = ($event.target as HTMLInputElement).checked"
    />
    <span class="reminder-choice__text">
      <strong>{{ label }}</strong>
      <span v-if="help">{{ help }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  help: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
</script>

<style scoped lang="scss">
.reminder-choice {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  min-height: 2.75rem;
  padding: 0.875rem 1rem;
  border: 3px solid var(--cinq-ink);
  background: var(--cinq-white);
  cursor: pointer;

  &__box {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    margin-top: 0.125rem;
    accent-color: var(--cinq-ink);
    cursor: pointer;
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    font-size: 1rem;
    line-height: 1.4;

    strong {
      font-size: 1.0625rem;
    }
  }
}
</style>
