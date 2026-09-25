<template>
  <div class="account-menu-panel">
    <div class="account-menu-panel__identity">
      <span class="account-menu-panel__avatar" aria-hidden="true">{{ initials }}</span>
      <span class="account-menu-panel__names">
        <strong>{{ user?.display_name }}</strong>
        <span>{{ user?.email }}</span>
      </span>
    </div>
    <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="account-menu-panel__item">
      {{ link.label }}
    </NuxtLink>
    <template v-if="adminLinks.length > 0">
      <div class="account-menu-panel__section">{{ $t('administration') }}</div>
      <NuxtLink
        v-for="link in adminLinks"
        :key="link.to"
        :to="link.to"
        class="account-menu-panel__item account-menu-panel__item--admin"
      >
        {{ link.label }}
      </NuxtLink>
    </template>
    <button
      type="button"
      class="account-menu-panel__item account-menu-panel__logout"
      @click="logOut"
    >
      <v-icon icon="mdi-logout" />{{ $t('log out') }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { user, initials, links, adminLinks, logOut } = useAccountMenu()
</script>

<style scoped lang="scss">
.account-menu-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: var(--cinq-border);
  background: var(--cinq-white);
  box-shadow: 12px 12px 0 var(--cinq-ink);

  &__identity {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1.25rem;
  }

  &__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border: 3px solid var(--cinq-ink);
    background: var(--cinq-blue);
    font-family: var(--cinq-font-display);
    font-size: 1.375rem;
    font-weight: 900;
  }

  &__names {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 0.9375rem;

    strong {
      font-size: 1.1875rem;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 3.5rem;
    padding: 0 1.25rem;
    border: 0;
    border-top: 3px solid var(--cinq-ink);
    background: transparent;
    color: var(--cinq-ink);
    font-family: var(--cinq-font-body);
    font-size: 1.0625rem;
    font-weight: 700;
    text-align: left;
    text-decoration: none;

    &--admin {
      background: var(--cinq-yellow);
    }
  }

  &__section {
    padding: 0.75rem 1.25rem 0.375rem;
    border-top: 3px solid var(--cinq-ink);
    background: var(--cinq-yellow);
    font-family: var(--cinq-font-mono);
    font-size: 0.8125rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  &__logout {
    width: 100%;
    background: var(--cinq-ink);
    color: var(--cinq-cream);
    cursor: pointer;
  }
}
</style>
