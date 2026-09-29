<template>
  <section :aria-labelledby="titleId" class="account-reminders">
    <header class="account-reminders__header">
      <h2 :id="titleId" class="account-reminders__title">{{ $t('reminders') }}</h2>
      <p class="account-reminders__intro">
        {{ $t('a reminder when you have cards to review, at most once a day.') }}
      </p>
    </header>

    <div class="account-reminders__body">
      <ReminderChoice
        :model-value="emailEnabled"
        name="reminder-email"
        :label="$t('reminder by email')"
        :disabled="isBusy"
        @update:model-value="changeEmail"
      />
      <ReminderTimeSelect
        :model-value="sendTime"
        :disabled="isBusy"
        @update:model-value="changeTime"
      />
    </div>

    <h3 class="account-reminders__subtitle">{{ $t('notifications') }}</h3>
    <ul v-if="devices.length > 0" class="account-reminders__devices">
      <ReminderDeviceRow
        v-for="device in devices"
        :key="device.id"
        :device
        :is-current="isCurrent(device)"
        :disabled="isBusy"
        @turn-off="turnOff(device)"
      />
    </ul>
    <p v-else class="account-reminders__empty">{{ $t('no device shows the notifications.') }}</p>

    <div class="account-reminders__footer">
      <p v-if="problem === 'denied'" role="alert" class="account-reminders__notice">
        {{
          $t(
            'notifications are blocked for this site. allow them in the settings of your browser, then try again.',
          )
        }}
      </p>
      <p v-else-if="problem === 'failed'" role="alert" class="account-reminders__notice">
        {{ $t('this device could not be registered for the notifications.') }}
      </p>

      <div v-if="needsInstall" role="status" class="account-reminders__notice">
        <p>
          {{
            $t(
              'on iphone and ipad, notifications only work once cinq is installed on the home screen.',
            )
          }}
        </p>
        <v-btn variant="outlined" size="large" @click="showInstallSteps">{{
          $t('see how to install')
        }}</v-btn>
      </div>
      <p v-else-if="!isSupported" role="status" class="account-reminders__notice">
        {{ $t('this browser cannot show notifications.') }}
      </p>
      <v-btn
        v-else-if="canEnableHere"
        color="secondary"
        size="large"
        prepend-icon="mdi-bell-ring-outline"
        :loading="isBusy"
        @click="enableHere"
      >
        {{ $t('turn on for this device') }}
      </v-btn>
    </div>
  </section>
</template>

<script setup lang="ts">
const titleId = useId()

const {
  emailEnabled,
  sendTime,
  devices,
  problem,
  needsInstall,
  isSupported,
  isCurrent,
  canEnableHere,
  isBusy,
  changeEmail,
  changeTime,
  enableHere,
  turnOff,
  showInstallSteps,
} = await useAccountReminders()
</script>

<style scoped lang="scss">
.account-reminders {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: var(--cinq-border);
  background: var(--cinq-cream);
  box-shadow: 12px 12px 0 var(--cinq-ink);

  &__header {
    padding: 1.125rem 1.25rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
  }

  &__title {
    margin: 0;
    font-size: clamp(1.25rem, 3vw, 1.625rem);
    line-height: 1.1;
    text-transform: uppercase;
  }

  &__intro {
    margin: 0.375rem 0 0;
    font-size: 1rem;
    line-height: 1.45;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }

  &__subtitle {
    margin: 0;
    padding: 0.75rem 1.25rem 0.375rem;
    border-top: 3px solid var(--cinq-ink);
    background: var(--cinq-yellow);
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__devices {
    margin: 0;
    padding: 0;
    background: var(--cinq-white);
    list-style: none;
  }

  &__empty {
    margin: 0;
    padding: 1rem 1.25rem;
    border-top: 3px solid var(--cinq-ink);
    background: var(--cinq-white);
    font-size: 1rem;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.25rem;
    border-top: 3px solid var(--cinq-ink);
  }

  &__notice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 0;
    font-size: 1rem;
    line-height: 1.45;

    p {
      margin: 0;
    }
  }
}
</style>
