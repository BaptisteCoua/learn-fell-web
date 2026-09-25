<template>
  <div class="confirmation-page">
    <div class="confirmation-page__eyebrow">{{ $t('account / sign up — step 2 / 2') }}</div>

    <main class="confirmation-page__main">
      <div v-if="state === 'verifying'" class="confirmation-page__block">
        <v-progress-linear indeterminate color="primary" height="8" />
        <p class="confirmation-page__text">{{ $t('confirming your address…') }}</p>
      </div>

      <div v-else-if="state === 'sent' || state === 'resent'" class="confirmation-page__block">
        <div class="confirmation-page__envelope" aria-hidden="true" />
        <h1 class="confirmation-page__title">{{ $t('check your emails') }}</h1>
        <p class="confirmation-page__text">
          <template v-if="email">
            {{ $t('we sent a confirmation link to') }}
            <strong class="confirmation-page__email">{{ email }}</strong
            >.
          </template>
          {{ $t('open it to activate your account: you cannot log in before.') }}
        </p>
        <ul class="confirmation-page__points">
          <li>{{ $t('the link is valid for 24 hours.') }}</li>
          <li>{{ $t('nothing received? look in your spam folder.') }}</li>
        </ul>
        <AccountNotice
          v-if="state === 'resent'"
          tone="success"
          :title="$t('a new link has just been sent.')"
          :text="$t('the previous one no longer works.')"
        />
        <div class="confirmation-page__actions">
          <v-btn
            color="primary"
            size="x-large"
            :loading="isSending"
            :disabled="!email"
            @click="resend"
          >
            {{ $t('send the email again') }}
          </v-btn>
          <v-btn to="/inscription" variant="outlined" size="x-large">
            {{ $t('change the email address') }}
          </v-btn>
        </div>
      </div>

      <div v-else-if="state === 'confirmed'" class="confirmation-page__block">
        <span class="confirmation-page__check" aria-hidden="true"
          ><v-icon icon="mdi-check-bold" size="64"
        /></span>
        <h1 class="confirmation-page__title">{{ $t('address confirmed') }}</h1>
        <p class="confirmation-page__text">
          {{
            $t('welcome, {name}. your account is active and you are logged in.', {
              name: displayName,
            })
          }}
        </p>
        <div class="confirmation-page__actions">
          <v-btn to="/sujets/nouveau" color="secondary" size="x-large">{{
            $t('create my first subject')
          }}</v-btn>
          <v-btn to="/categories" variant="outlined" size="x-large">{{
            $t('explore the catalogue')
          }}</v-btn>
        </div>
      </div>

      <div v-else class="confirmation-page__block">
        <h1 class="confirmation-page__title">{{ $t('link expired') }}</h1>
        <p class="confirmation-page__text">
          {{
            $t('this confirmation link has expired or has already been used. ask for a new one.')
          }}
        </p>
        <form class="account-form" @submit.prevent="resend">
          <AccountField
            v-model="email"
            :label="$t('email address')"
            type="email"
            autocomplete="email"
          />
          <v-btn type="submit" color="primary" size="x-large" :loading="isSending">
            {{ $t('get a new link') }}
          </v-btn>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { state, email, displayName, isSending, resend } = useEmailConfirmation()

useHead({ title: () => t('confirm your email address') })
</script>

<style scoped lang="scss">
.confirmation-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 2rem clamp(1rem, 5vw, 4rem) 4rem;

  &__eyebrow {
    font-family: var(--cinq-font-mono);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 40rem;
  }

  &__envelope {
    width: min(100%, 16.25rem);
    height: 11.25rem;
    border: var(--cinq-border);
    background:
      linear-gradient(
          to top right,
          transparent calc(50% - 2px),
          var(--cinq-ink) 50%,
          transparent calc(50% + 2px)
        )
        left top / 50% 55% no-repeat,
      linear-gradient(
          to top left,
          transparent calc(50% - 2px),
          var(--cinq-ink) 50%,
          transparent calc(50% + 2px)
        )
        right top / 50% 55% no-repeat,
      var(--cinq-yellow);
    box-shadow: 12px 12px 0 var(--cinq-ink);
  }

  &__check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 7.5rem;
    height: 7.5rem;
    border: var(--cinq-border);
    background: var(--cinq-blue);
    box-shadow: 10px 10px 0 var(--cinq-ink);
  }

  &__title {
    margin: 0;
    font-size: clamp(2.5rem, 8vw, 5.5rem);
    line-height: 0.88;
    text-transform: uppercase;
  }

  &__text {
    margin: 0;
    font-size: clamp(1.0625rem, 1vw + 0.75rem, 1.3125rem);
    line-height: 1.5;
  }

  &__email {
    padding: 0 0.375rem;
    background: var(--cinq-yellow);
  }

  &__points {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin: 0;
    padding: 0;
    font-size: 1.125rem;
    list-style: none;

    li {
      padding-top: 0.625rem;
      border-top: 3px solid var(--cinq-ink);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
