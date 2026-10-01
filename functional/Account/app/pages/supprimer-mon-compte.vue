<template>
  <AccountSplit
    :eyebrow="$t('account / deletion')"
    :title="$t('delete my account')"
    :points="[
      $t('your account is closed right away'),
      $t('everything is erased on {date}', { date: eraseOn }),
      $t('log in before then to change your mind'),
    ]"
  >
    <section class="account-deletion__section">
      <h2 class="account-deletion__heading">{{ $t('what will be erased') }}</h2>
      <ul class="account-deletion__list">
        <li>{{ $t('your display name and your email address') }}</li>
        <li>{{ $t('your progress and your review history') }}</li>
        <li>{{ $t('your review reminder settings and devices') }}</li>
        <li>{{ $t('your drafts and your unpublished subjects') }}</li>
      </ul>
      <h2 class="account-deletion__heading">{{ $t('what will be kept, without your name') }}</h2>
      <ul class="account-deletion__list">
        <li>{{ $t('the reports you made and your moderation decisions') }}</li>
      </ul>
    </section>

    <form class="account-form" @submit.prevent="submit">
      <AccountField
        v-model="password"
        :label="$t('password')"
        type="password"
        autocomplete="current-password"
        :help="$t('type your password to confirm.')"
        :error="passwordError"
      />
      <AccountNotice v-if="errorMessage" tone="error" :title="errorMessage" />
      <v-btn type="submit" color="error" size="x-large" :loading="isSubmitting" block>
        {{ $t('delete my account') }}
      </v-btn>
    </form>
    <p class="account-form__footnote">
      <NuxtLink to="/compte" class="account-form__link">{{ $t('keep my account') }}</NuxtLink>
    </p>
  </AccountSplit>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { state, password, passwordError, errorMessage, isSubmitting, submit } =
  await useAccountDeletion()

const eraseOn = computed(() => longDate(state.value.erase_on))

useHead({ title: () => t('delete my account') })
</script>

<style scoped lang="scss">
.account-deletion {
  &__section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__heading {
    margin: 0;
    font-size: 1.0625rem;
    text-transform: uppercase;
  }

  &__list {
    margin: 0;
    padding-left: 1.25rem;
    line-height: 1.5;
  }
}
</style>
