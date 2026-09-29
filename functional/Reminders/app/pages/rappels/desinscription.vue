<template>
  <div class="unsubscribe-page">
    <section class="unsubscribe-page__panel" aria-live="polite">
      <h1 class="unsubscribe-page__title">{{ $t('reminder emails') }}</h1>
      <div class="unsubscribe-page__body">
        <p v-if="state === 'pending'">{{ $t('turning the reminder emails off…') }}</p>

        <template v-else-if="state === 'done'">
          <p>
            <strong>{{ $t('you will no longer receive the reminders by email.') }}</strong>
            {{ $t('the notifications on your devices, if you turned them on, keep going.') }}
          </p>
          <v-btn to="/compte#rappels" color="primary" size="large">{{
            $t('manage my reminders')
          }}</v-btn>
        </template>

        <template v-else-if="state === 'invalid'">
          <p>
            <strong>{{ $t('this link is not valid.') }}</strong>
            {{
              $t(
                'it may have been changed, or the reminders were turned back on since. you can set them in your account.',
              )
            }}
          </p>
          <v-btn to="/compte#rappels" variant="outlined" size="large">{{
            $t('manage my reminders')
          }}</v-btn>
        </template>

        <template v-else>
          <p role="alert">{{ $t('something went wrong, please try again') }}</p>
          <v-btn color="primary" size="large" @click="retry">{{ $t('try again') }}</v-btn>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ title: () => t('reminder emails') })

const { state, retry } = useUnsubscribe()
</script>

<style scoped lang="scss">
.unsubscribe-page {
  display: flex;
  justify-content: center;
  padding: 2.5rem clamp(1rem, 5vw, 4rem) 3rem;
}

.unsubscribe-page__panel {
  width: min(100%, 36rem);
  border: var(--cinq-border);
  background: var(--cinq-cream);
  box-shadow: 12px 12px 0 var(--cinq-ink);
}

.unsubscribe-page__title {
  margin: 0;
  padding: 1.125rem 1.5rem;
  background: var(--cinq-ink);
  color: var(--cinq-cream);
  font-size: clamp(1.375rem, 4vw, 1.75rem);
  line-height: 1.1;
  text-transform: uppercase;
}

.unsubscribe-page__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.5rem;
  font-size: 1.0625rem;
  line-height: 1.5;

  p {
    margin: 0;
  }
}
</style>
