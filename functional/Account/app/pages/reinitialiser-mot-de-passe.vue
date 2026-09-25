<template>
  <AccountSplit
    :eyebrow="$t('account / new password')"
    :title="$t('fresh start.')"
    :points="[
      $t('choose at least 8 characters'),
      $t('type it twice'),
      $t('your other devices will be logged out'),
    ]"
  >
    <form v-if="state === 'form'" class="account-form" @submit.prevent="submit">
      <AccountField
        v-model="password"
        :label="$t('new password')"
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
        {{ $t('save the password') }}
      </v-btn>
    </form>

    <template v-else-if="state === 'success'">
      <AccountNotice
        tone="success"
        :title="$t('password changed.')"
        :text="$t('you can now log in with your new password.')"
      />
      <v-btn to="/connexion" color="primary" size="x-large">{{ $t('log in') }}</v-btn>
    </template>

    <template v-else>
      <AccountNotice
        tone="error"
        :title="$t('this link has expired or has already been used.')"
        :text="$t('reset links are valid for 60 minutes and can be used only once.')"
      />
      <v-btn to="/mot-de-passe-oublie" color="primary" size="x-large">{{
        $t('ask for a new link')
      }}</v-btn>
    </template>
  </AccountSplit>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { password, passwordConfirmation, fieldErrors, state, isSubmitting, submit } =
  useResetPasswordForm()

useHead({ title: () => t('new password') })
</script>
