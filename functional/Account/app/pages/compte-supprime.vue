<template>
  <AccountSplit
    tone="blue"
    :eyebrow="$t('account / deletion')"
    :title="$t('your account is closed.')"
  >
    <AccountNotice
      tone="success"
      :title="$t('your account will be erased on {date}.', { date: eraseOn })"
      :text="$t('we sent you an email that confirms your request.')"
    />
    <p>
      {{
        $t('changed your mind? log in before {date}: everything will be restored.', {
          date: eraseOn,
        })
      }}
    </p>
    <div class="cinq-actions">
      <v-btn to="/connexion" color="primary" size="x-large">{{ $t('log in') }}</v-btn>
      <v-btn to="/" variant="outlined" size="x-large">{{ $t('back to home') }}</v-btn>
    </div>
  </AccountSplit>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// The request has closed the session: the date comes with the address of this page.
const eraseOn = computed(() =>
  typeof route.query.le === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(route.query.le)
    ? longDate(route.query.le)
    : '',
)

useHead({ title: () => t('your account is closed.') })
</script>
