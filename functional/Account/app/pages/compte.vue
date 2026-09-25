<template>
  <div class="account-page">
    <AccountMenuPanel />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()

useHead({ title: () => t('my account') })
</script>

<style scoped>
.account-page {
  padding: 1.5rem clamp(1rem, 5vw, 4rem) 3rem;
}
</style>
