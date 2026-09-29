<template>
  <div class="account-page">
    <AccountMenuPanel />
    <AccountReminders />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

useHead({ title: () => t('my account') })
</script>

<style scoped>
.account-page {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  align-items: start;
  gap: 2rem 2.5rem;
  padding: 1.5rem clamp(1rem, 5vw, 4rem) 3rem;
}
</style>
