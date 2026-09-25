<template>
  <div class="subject-moderation-panel">
    <strong class="subject-moderation-panel__banner">{{ $t('administrator view.') }}</strong>
    <div class="cinq-actions">
      <v-btn
        v-if="withEdit"
        :to="`/sujets/${subjectId}/modifier`"
        color="secondary"
        size="large"
        prepend-icon="mdi-pencil"
      >
        {{ $t('edit') }}
      </v-btn>
      <v-btn v-if="currentStatus === 'retired'" color="primary" size="large" @click="openRestore">
        {{ $t('restore the subject') }}
      </v-btn>
      <v-btn v-else color="error" size="large" @click="openRetire">{{
        $t('retire the subject')
      }}</v-btn>
    </div>

    <RetireSubjectDialog
      :open="isRetireOpen"
      :subject-id="subjectId"
      :title
      @close="closeRetire"
      @retired="onRetired"
    />
    <ConfirmDialog
      :open="isRestoreOpen"
      :title="$t('restore “{title}”?', { title })"
      :confirm-label="$t('restore the subject')"
      @close="closeRestore"
      @confirm="confirmRestore"
    >
      {{
        $t(
          'the subject becomes a draft of its author again. they can edit it and publish it again.',
        )
      }}
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  subjectId: { type: Number, required: true },
  title: { type: String, required: true },
  status: { type: String as PropType<SubjectStatus>, required: true },
  withEdit: { type: Boolean, default: true },
})
const emit = defineEmits<{ status: [SubjectStatus] }>()

const {
  currentStatus,
  isRetireOpen,
  isRestoreOpen,
  openRetire,
  closeRetire,
  openRestore,
  closeRestore,
  onRetired,
  confirmRestore,
} = useSubjectModeration(props.subjectId, props.title, props.status, (status) =>
  emit('status', status),
)
</script>

<style scoped>
.subject-moderation-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.subject-moderation-panel__banner {
  padding: 0.375rem 0.75rem;
  align-self: flex-start;
  background: var(--cinq-ink);
  color: var(--cinq-cream);
  font-size: 0.875rem;
}
</style>
