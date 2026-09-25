import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

/**
 * Non-blocking confirmations ("Sujet publié", "Question supprimée") through vue3-toastify.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {
    position: 'bottom-right',
    autoClose: 4000,
    hideProgressBar: true,
    closeButton: false,
    transition: 'slide',
    theme: 'light',
  } satisfies ToastContainerOptions)
})
