<template>
  <div
    :role="tone === 'error' ? 'alert' : 'status'"
    :class="['account-notice', `account-notice--${tone}`]"
  >
    <v-icon :icon="icon" class="account-notice__icon" />
    <div class="account-notice__body">
      <strong>{{ title }}</strong>
      <span v-if="text">{{ text }}</span>
      <div v-if="$slots.default" class="account-notice__actions"><slot /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const ICONS = {
  error: 'mdi-alert-circle-outline',
  info: 'mdi-information-outline',
  success: 'mdi-check-bold',
} as const

const props = defineProps({
  tone: { type: String as PropType<keyof typeof ICONS>, required: true },
  title: { type: String, required: true },
  text: { type: String, default: '' },
})

const icon = computed(() => ICONS[props.tone])
</script>

<style scoped lang="scss">
.account-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.125rem 1.25rem;
  border: var(--cinq-border);
  box-shadow: 6px 6px 0 var(--cinq-ink);
  font-size: 1.0625rem;
  line-height: 1.45;

  &--error {
    border-color: var(--cinq-red);
    background: var(--cinq-white);
    box-shadow: 6px 6px 0 var(--cinq-red);
  }

  &--info {
    background: var(--cinq-blue);
  }

  &--success {
    background: var(--cinq-yellow);
  }

  &__icon {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 0.25rem;
    min-width: 0;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    margin-top: 0.75rem;
  }
}
</style>
