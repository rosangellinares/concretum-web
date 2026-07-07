// Kill-switch service worker: unregisters any previously-installed worker and
// clears its caches, then reloads controlled pages. Served with Cache-Control:
// no-cache, so existing installs revalidate, see this changed file, and run it.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
