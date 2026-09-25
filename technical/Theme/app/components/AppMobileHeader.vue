<template>
  <header class="app-mobile-header">
    <NuxtLink to="/" class="app-mobile-header__logo">CINQ</NuxtLink>
    <NuxtLink
      v-if="isSignedIn"
      to="/compte"
      :aria-label="$t('my account')"
      class="app-mobile-header__avatar"
    >
      {{ initials }}
    </NuxtLink>
    <NuxtLink v-else to="/connexion" class="app-mobile-header__login">{{ $t('log in') }}</NuxtLink>
  </header>
</template>

<script setup lang="ts">
const { isSignedIn, initials } = useAppNavigation()
</script>

<style scoped lang="scss">
.app-mobile-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 64px;
  border-bottom: var(--cinq-border);
  background: var(--cinq-cream);

  &__logo {
    display: flex;
    align-items: center;
    padding: 0 1.125rem;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    font-family: var(--cinq-font-display);
    font-size: clamp(1.1875rem, 5.64vw, 1.375rem);
    font-weight: 900;
    text-decoration: none;
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    border-left: var(--cinq-border);
    background: var(--cinq-blue);
    font-family: var(--cinq-font-display);
    font-weight: 900;
    text-decoration: none;
  }

  &__login {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 0 1rem;
    line-height: 1.1;
    text-align: right;
    overflow-wrap: anywhere;
    border-left: var(--cinq-border);
    font-weight: 700;
  }
}
</style>
