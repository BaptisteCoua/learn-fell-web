<template>
  <AccountSplit
    :eyebrow="$t('account / log in')"
    :title="$t('welcome back.')"
    :points="[
      $t('find your subjects and your drafts'),
      $t('pick up your reviews where you left them'),
      $t('stay logged in for 30 days on this device'),
    ]"
  >
    <GoogleSoonButton />

    <AccountNotice
      v-if="state === 'error'"
      tone="error"
      :title="errorMessage"
      :text="$t('check what you typed, or reset your password.')"
    />
    <AccountNotice v-else-if="state === 'locked'" tone="error" :title="errorMessage">
      <v-btn to="/mot-de-passe-oublie" variant="outlined">{{ $t('reset my password') }}</v-btn>
    </AccountNotice>
    <AccountNotice
      v-else-if="state === 'unverified'"
      tone="info"
      :title="$t('your email address is not confirmed yet.')"
      :text="$t('open the link you received by email to activate your account.')"
    >
      <v-btn variant="outlined" @click="resend">{{ $t('send the link again') }}</v-btn>
    </AccountNotice>
    <AccountNotice
      v-else-if="state === 'resent'"
      tone="success"
      :title="$t('a new link has just been sent.')"
      :text="$t('check the inbox of {email}. the previous link no longer works.', { email })"
    />

    <form class="account-form" @submit.prevent="submit">
      <AccountField
        v-model="email"
        :label="$t('email address')"
        type="email"
        autocomplete="email"
      />
      <AccountField
        v-model="password"
        :label="$t('password')"
        type="password"
        autocomplete="current-password"
      >
        <template #aside>
          <NuxtLink to="/mot-de-passe-oublie" class="account-form__link">
            {{ $t('forgot your password?') }}
          </NuxtLink>
        </template>
      </AccountField>
      <v-btn type="submit" color="primary" size="x-large" :loading="isSubmitting" block>
        {{ $t('log in') }}
      </v-btn>
    </form>

    <p class="account-form__footnote">
      {{ $t('no account yet?') }}
      <NuxtLink to="/inscription" class="account-form__link">{{
        $t('create an account')
      }}</NuxtLink>
    </p>
  </AccountSplit>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { t } = useI18n()
const { email, password, state, errorMessage, isSubmitting, submit, resend } = useLoginForm()

useHead({ title: () => t('log in') })
</script>
