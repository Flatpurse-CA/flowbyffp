self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler — required for install criteria on Chromium/Android.
// No caching yet: avoids serving stale app shells while the app is still changing daily.
self.addEventListener("fetch", () => {});
