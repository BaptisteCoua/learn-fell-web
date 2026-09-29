<template>
  <div class="reminder-time-select">
    <label :for="selectId" class="reminder-time-select__label">{{ $t('reminder time') }}</label>
    <select
      :id="selectId"
      name="reminder-time"
      class="reminder-time-select__control"
      :value="model"
      :disabled
      @change="model = ($event.target as HTMLSelectElement).value"
    >
      <option v-for="time in SEND_TIMES" :key="time" :value="time">{{ time }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps({
  disabled: { type: Boolean, default: false },
})

const selectId = useId()
</script>

<style scoped lang="scss">
.reminder-time-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__label {
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;
  }

  &__control {
    min-height: 3.25rem;
    padding: 0 1rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-white);
    color: var(--cinq-ink);
    font-family: var(--cinq-font-mono);
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
  }
}
</style>
