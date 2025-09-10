const CACHE_NAME = "ganado-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/animal.html",
  "/app.js",
  "/animal.js",
  "/style.css",
  "/card.css",
  "/manifest.json"
];

// Instalar y guardar en caché
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activar y limpiar cachés viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
});

// Interceptar solicitudes y responder desde caché
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
