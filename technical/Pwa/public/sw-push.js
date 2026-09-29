// Imported by the service worker that Workbox generates (research R10 of 002): it shows the
// push messages the API sends, and a click opens the page they point to.

self.addEventListener('push', (event) => {
  const message = event.data ? event.data.json() : null

  if (!message) {
    return
  }

  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: message.icon,
      badge: message.badge,
      tag: message.tag,
      data: message.data,
      lang: 'fr',
    }),
  )
})

// An open tab of CINQ comes forward and goes to the page; otherwise a new tab opens.
const openPage = async (url) => {
  const target = new URL(url, self.location.origin)
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  const openTab = windows.find((client) => new URL(client.url).origin === target.origin)

  if (openTab) {
    try {
      await openTab.focus()
      await openTab.navigate(target.href)
      return
    } catch {
      // A tab the service worker does not control cannot be navigated.
    }
  }

  await self.clients.openWindow(target.href)
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(openPage(event.notification.data?.url ?? '/'))
})
