<template>
  <v-dialog :model-value="isOpen" max-width="36rem" @update:model-value="later">
    <div role="document" class="reminder-proposal">
      <h2 class="reminder-proposal__title">{{ $t('receive a reminder?') }}</h2>
      <div class="reminder-proposal__body">
        <p>
          {{
            $t(
              'we can let you know when you have cards to review, at most once a day, at the time you choose.',
            )
          }}
        </p>
        <ReminderChoice
          v-model="wantsPush"
          name="reminder-push"
          :label="$t('notifications on this device')"
          :disabled="isSaving"
        />
        <ReminderChoice
          v-model="wantsEmail"
          name="reminder-email"
          :label="$t('email')"
          :disabled="isSaving"
        />
        <ReminderTimeSelect v-model="sendTime" :disabled="isSaving" />
        <p v-if="problem === 'denied'" role="alert" class="reminder-proposal__problem">
          {{
            $t(
              'notifications are blocked for this site. allow them in the settings of your browser, then try again.',
            )
          }}
        </p>
        <p v-else-if="problem === 'failed'" role="alert" class="reminder-proposal__problem">
          {{ $t('this device could not be registered for the notifications.') }}
        </p>
      </div>
      <div class="reminder-proposal__actions cinq-actions">
        <v-btn variant="outlined" size="large" :disabled="isSaving" @click="later">{{
          $t('later')
        }}</v-btn>
        <v-btn
          color="primary"
          size="large"
          :disabled="!canActivate"
          :loading="isSaving"
          @click="activate"
        >
          {{ $t('activate') }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
const { isOpen, wantsPush, wantsEmail, sendTime, isSaving, canActivate, problem, activate, later } =
  useReminderProposal()
</script>

<style scoped lang="scss">
.reminder-proposal {
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
    gap: 0.875rem;
    padding: 1.5rem;
    font-size: 1.0625rem;
    line-height: 1.5;

    p {
      margin: 0;
    }
  }

  &__problem {
    padding: 0.625rem 0.875rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-size: 0.9375rem;
  }

  &__actions {
    padding: 0 1.5rem 1.5rem;
  }
}
</style>
