export default defineNuxtConfig({
  modules: ['vuetify-nuxt-module'],
  vuetify: {
    moduleOptions: {
      prefixComposables: ['useLayout'],
      ssrClientHints: { reloadOnFirstRequest: false, viewportSize: true, prefersColorScheme: true },
    },
  },
})
