<template>
  <AccountSplit
    tone="blue"
    :eyebrow="$t('account / forgot password')"
    :title="$t('it happens.')"
    :points="[
      $t('a link valid for 60 minutes'),
      $t('usable only once'),
      $t('your old password keeps working in the meantime'),
    ]"
  >
    <template v-if="!isSent">
      <p class="account-form__intro">
        {{
          $t(
            'type the email address of your account. we will send you a link to choose a new password.',
          )
        }}
      </p>
      <form class="account-form" @submit.prevent="submit">
        <AccountField
          v-model="email"
          :label="$t('email address')"
          type="email"
          autocomplete="email"
        />
        <v-btn type="submit" color="primary" size="x-large" :loading="isSubmitting" block>
          {{ $t('get the link') }}
        </v-btn>
      </form>
      <p class="account-form__footnote">
        <NuxtLink to="/connexion" class="account-form__link">{{
          $t('back to logging in')
        }}</NuxtLink>
      </p>
    </template>

    <template v-else>
      <AccountNotice
        tone="success"
        :title="$t('check your emails.')"
        :text="
          $t(
            'if an account exists for {email}, you will receive a link valid for 60 minutes. it can be used only once.',
            { email },
          )
        "
      />
      <div class="cinq-actions">
        <v-btn variant="outlined" size="x-large" :loading="isSubmitting" @click="submit">
          {{ $t('send the link again') }}
        </v-btn>
        <v-btn to="/connexion" color="primary" size="x-large">{{ $t('back to logging in') }}</v-btn>
      </div>
    </template>
  </AccountSplit>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { t } = useI18n()
const { email, isSent, isSubmitting, submit } = useForgotPasswordForm()

useHead({ title: () => t('forgot your password?') })
</script>
