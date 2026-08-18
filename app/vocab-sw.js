/* lazeword — service worker (offline app shell, network-first) */
const CACHE = "lazeword-v1";
const ASSETS = ["./app/lazeword.html", "./app/vocab-manifest.webmanifest", "./app/vocab-icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (url.includes("api.dictionaryapi.dev")) return; // live API: never intercept
  if (e.request.method !== "GET") return;

  // Network-first: always try the network so updates appear immediately;
  // fall back to cache when offline.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        if (res.ok && (url.startsWith(self.location.origin))) {
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
