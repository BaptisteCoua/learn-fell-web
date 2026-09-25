declare global {
  interface Window {
    __cinqRequestedUrl?: string
  }
}

/**
 * The offline page: try again the page that was asked for, once the network is back.
 */
export const useOfflinePage = () => {
  const retry = (): void => {
    const target = window.__cinqRequestedUrl

    if (target && new URL(target).pathname !== '/hors-ligne') {
      window.location.assign(target)
    } else {
      window.location.reload()
    }
  }

  return { retry }
}
