<template>
  <v-menu location="bottom end" :offset="4" max-width="380" width="380">
    <template #activator="{ props: activatorProps }">
      <button
        type="button"
        :aria-label="$t('my account')"
        v-bind="activatorProps"
        class="account-menu__trigger"
      >
        {{ initials }}
      </button>
    </template>
    <AccountMenuPanel />
  </v-menu>
</template>

<script setup lang="ts">
const { initials } = useAccountMenu()
</script>

<style scoped>
.account-menu__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 100%;
  border: 0;
  border-left: var(--cinq-border);
  background: var(--cinq-blue);
  color: var(--cinq-ink);
  font-family: var(--cinq-font-display);
  font-size: 1.375rem;
  font-weight: 900;
  cursor: pointer;
}
</style>
