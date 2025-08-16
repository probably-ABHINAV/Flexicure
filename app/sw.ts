import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"

declare const self: ServiceWorkerGlobalScope

// Clean up old caches
cleanupOutdatedCaches()

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  }),
)

// Cache images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
)

// Cache static assets
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style" || request.destination === "font",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
)

// Cache pages
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  }),
)

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle offline actions when back online
  const offlineActions = await getOfflineActions()

  for (const action of offlineActions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body,
      })
      await removeOfflineAction(action.id)
    } catch (error) {
      console.error("Failed to sync offline action:", error)
    }
  }
}

async function getOfflineActions() {
  // Get offline actions from IndexedDB
  return []
}

async function removeOfflineAction(id: string) {
  // Remove synced action from IndexedDB
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    data: data.data,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icon-view.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icon-dismiss.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(self.clients.openWindow(event.notification.data.url || "/dashboard"))
  }
})
