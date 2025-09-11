const CACHE_NAME = "gana-bien-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./animal.html",
  "./assets/js/app.js",
  "./assets/js/animal.js",
  "./assets/js/storage.js",
  "./assets/css/card.css",
  "./assets/css/styles.css",
  "./manifest.json"
];

// Instalar SW y cachear archivos
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        await cache.addAll(FILES_TO_CACHE);
        console.log("✅ Archivos cacheados correctamente");
      } catch (err) {
        console.error("⚠️ Error cacheando archivos:", err);
      }
    })
  );
  self.skipWaiting(); // fuerza que este SW reemplace al anterior
});

// Activar y limpiar cachés viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Eliminando caché viejo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // controla clientes inmediatamente
});

// Interceptar solicitudes y responder desde caché primero
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // Si no hay conexión y no está en cache
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
