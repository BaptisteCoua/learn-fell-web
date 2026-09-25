<template>
  <div class="report-subject">
    <v-btn variant="outlined" size="large" prepend-icon="mdi-flag-outline" @click="open">{{
      $t('report')
    }}</v-btn>

    <component
      :is="isSheet ? VBottomSheet : VDialog"
      :model-value="isOpen"
      @update:model-value="close"
    >
      <div role="document" class="report-subject__panel">
        <h2 class="report-subject__title">{{ $t('report this subject') }}</h2>

        <div v-if="state === 'sent'" class="report-subject__body">
          <p>
            <strong>{{ $t('thank you, your report is saved.') }}</strong>
            {{
              $t('an administrator will look into it. in the meantime, the subject stays visible.')
            }}
          </p>
          <v-btn color="primary" size="large" @click="close">{{ $t('close') }}</v-btn>
        </div>

        <div v-else-if="state === 'duplicate'" class="report-subject__body">
          <p>
            <strong>{{ $t('you already reported this subject.') }}</strong>
            {{ $t('your report is being looked into by an administrator.') }}
          </p>
          <v-btn color="primary" size="large" @click="close">{{ $t('close') }}</v-btn>
        </div>

        <form v-else class="report-subject__body" @submit.prevent="submit">
          <fieldset class="report-subject__reasons">
            <legend class="report-subject__legend">{{ $t('reason') }}</legend>
            <label v-for="item in reasons" :key="item.value" class="report-subject__reason">
              <input v-model="reason" type="radio" name="report-reason" :value="item.value" />
              {{ item.label }}
            </label>
          </fieldset>
          <p v-if="error === 'reason'" role="alert" class="report-subject__error">
            {{ $t('choose a reason.') }}
          </p>
          <p v-else-if="error" role="alert" class="report-subject__error">{{ error }}</p>
          <label :for="commentId" class="report-subject__legend">{{
            $t('comment (optional)')
          }}</label>
          <v-textarea
            :id="commentId"
            v-model="comment"
            rows="3"
            counter="500"
            maxlength="500"
            hide-details="auto"
          />
          <div class="cinq-actions">
            <v-btn variant="outlined" size="large" @click="close">{{ $t('cancel') }}</v-btn>
            <v-btn type="submit" color="primary" size="large" :loading="isSending">{{
              $t('send the report')
            }}</v-btn>
          </div>
        </form>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { VBottomSheet } from 'vuetify/components/VBottomSheet'
import { VDialog } from 'vuetify/components/VDialog'

const props = defineProps({
  subjectId: { type: Number, required: true },
})

const commentId = useId()
const { reasons } = useReportReasons()
const { isOpen, reason, comment, state, error, isSending, isSheet, open, close, submit } =
  useReportSubject(props.subjectId)
</script>

<style scoped lang="scss">
.report-subject__panel {
  border: var(--cinq-border);
  background: var(--cinq-cream);
  box-shadow: 12px 12px 0 var(--cinq-ink);
}

.report-subject__title {
  margin: 0;
  padding: 1.125rem 1.5rem;
  background: var(--cinq-ink);
  color: var(--cinq-cream);
  font-size: clamp(1.25rem, 3vw, 1.625rem);
  text-transform: uppercase;
}

.report-subject__body {
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

.report-subject__reasons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.report-subject__legend {
  margin-bottom: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.154em;
  text-transform: uppercase;
}

.report-subject__reason {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.75rem;
  padding: 0 0.75rem;
  border: 3px solid var(--cinq-ink);
  background: var(--cinq-white);
  font-weight: 700;
  cursor: pointer;

  input {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: var(--cinq-ink);
  }
}

.report-subject__error {
  padding: 0.625rem 0.875rem;
  background: var(--cinq-ink);
  color: var(--cinq-cream);
  font-size: 0.9375rem;
}
</style>
