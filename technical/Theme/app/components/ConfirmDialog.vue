<template>
  <v-dialog :model-value="open" @update:model-value="emit('close')">
    <div role="document" class="confirm-dialog">
      <h2 class="confirm-dialog__title">{{ title }}</h2>
      <div class="confirm-dialog__body"><slot /></div>
      <div class="confirm-dialog__actions cinq-actions">
        <v-btn variant="outlined" size="large" @click="emit('close')">{{
          cancelLabel || $t('cancel')
        }}</v-btn>
        <v-btn
          v-if="confirmLabel"
          :color="danger ? 'error' : 'primary'"
          size="large"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  confirmLabel: { type: String, default: '' },
  cancelLabel: { type: String, default: '' },
  danger: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm', 'close'])
</script>

<style scoped lang="scss">
.confirm-dialog {
  border: var(--cinq-border);
  background: var(--cinq-cream);
  box-shadow: 12px 12px 0 var(--cinq-ink);

  &__title {
    margin: 0;
    padding: 1.125rem 1.5rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-size: clamp(1.25rem, 3vw, 1.625rem);
    line-height: 1.1;
    text-transform: uppercase;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
    font-size: 1.0625rem;
    line-height: 1.5;
  }

  &__actions {
    padding: 0 1.5rem 1.5rem;
  }
}
</style>
