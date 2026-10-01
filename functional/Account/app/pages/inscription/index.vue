<template>
  <AccountSplit
    :eyebrow="$t('account / sign up — step 1 / 2')"
    :title="$t('your turn to write.')"
    :points="[
      $t('create subjects and their questions'),
      $t('prepare them as drafts, publish when ready'),
      $t('review with the leitner method'),
    ]"
  >
    <GoogleSoonButton />

    <AccountNotice v-if="errorMessage" tone="error" :title="errorMessage" />

    <form class="account-form" @submit.prevent="submit">
      <AccountField
        v-model="displayName"
        :label="$t('display name')"
        autocomplete="nickname"
        :help="$t('shown on your published subjects.')"
        :error="fieldErrors.display_name"
      />
      <AccountField
        v-model="email"
        :label="$t('email address')"
        type="email"
        autocomplete="email"
        :help="$t('never shown publicly.')"
        :error="fieldErrors.email"
      />
      <AccountField
        v-model="password"
        :label="$t('password')"
        type="password"
        autocomplete="new-password"
        :help="$t('8 characters minimum.')"
        :error="fieldErrors.password"
      />
      <AccountField
        v-model="passwordConfirmation"
        :label="$t('confirm the password')"
        type="password"
        autocomplete="new-password"
        :error="fieldErrors.password_confirmation"
      />
      <v-btn type="submit" color="primary" size="x-large" :loading="isSubmitting" block>
        {{ $t('create my account') }}
      </v-btn>
    </form>

    <p class="account-form__footnote">
      {{ $t('we will send you a link to confirm your email address. already signed up?') }}
      <NuxtLink to="/connexion" class="account-form__link">{{ $t('log in') }}</NuxtLink>
    </p>
  </AccountSplit>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { t } = useI18n()
const {
  displayName,
  email,
  password,
  passwordConfirmation,
  fieldErrors,
  errorMessage,
  isSubmitting,
  submit,
} = useRegisterForm()

useHead({ title: () => t('create an account') })
</script>
