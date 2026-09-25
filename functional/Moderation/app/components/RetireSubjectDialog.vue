<template>
  <v-dialog :model-value="open" @update:model-value="emit('close')">
    <div role="document" class="retire-subject">
      <h2 class="retire-subject__title">{{ $t('retire “{title}”', { title }) }}</h2>
      <form class="retire-subject__body" @submit.prevent="submit(subjectId, title)">
        <p>
          {{
            reportCount > 0
              ? $t(
                  'the subject will no longer be visible to the public and its {count} reports will be closed. its author will see the “retired” status and your reason.',
                  { count: reportCount },
                )
              : $t(
                  'the subject will no longer be visible to the public. its author will see the “retired” status and your reason.',
                )
          }}
        </p>
        <label :for="reasonId" class="retire-subject__label">{{
          $t('reason for retiring (visible to the author)')
        }}</label>
        <v-textarea
          :id="reasonId"
          v-model="reason"
          rows="3"
          :error-messages="isReasonMissing ? [$t('type a reason: the author will see it.')] : []"
          hide-details="auto"
        />
        <div class="cinq-actions">
          <v-btn variant="outlined" size="large" @click="emit('close')">{{ $t('cancel') }}</v-btn>
          <v-btn type="submit" color="error" size="large" :loading="isSending">{{
            $t('retire the subject')
          }}</v-btn>
        </div>
      </form>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps({
  open: { type: Boolean, required: true },
  subjectId: { type: Number, required: true },
  title: { type: String, required: true },
  reportCount: { type: Number, default: 0 },
})
const emit = defineEmits(['close', 'retired'])

const reasonId = useId()
const { reason, isReasonMissing, isSending, submit } = useRetireForm(() => emit('retired'))
</script>

<style scoped lang="scss">
.retire-subject {
  border: var(--cinq-border);
  background: var(--cinq-cream);
  box-shadow: 14px 14px 0 var(--cinq-yellow);

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
    gap: 1rem;
    padding: 1.5rem;
    font-size: 1.0625rem;
    line-height: 1.5;

    p {
      margin: 0;
    }
  }

  &__label {
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.125rem;
    text-transform: uppercase;
  }
}
</style>
