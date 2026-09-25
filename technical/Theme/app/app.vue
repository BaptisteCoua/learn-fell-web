<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <NuxtPwaManifest />
    <!-- Installing, updating and offline state come from the Pwa layer. -->
    <ClientOnly>
      <OfflineBanner />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <InstallPrompt />
      <UpdatePrompt />
    </ClientOnly>
  </v-app>
</template>
