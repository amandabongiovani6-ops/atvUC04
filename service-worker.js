const CACHE_NAME = "meu-pwa-cache-v1";
const FILES_TO_CACHE = [
  "index.html",
  "sobre.html",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/logo.jpg",
  "style.css",
  "app.js" // caso tenha um JS principal
];

// Instala e adiciona arquivos ao cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // Para navegação, se offline, usa o index.html
    event.respondWith(
      fetch(event.request).catch(() => caches.match("index.html"))
    );
  } else {
    // Para outros requests, tenta cache primeiro, senão busca da rede
    event.respondWith(
      caches.match(event.request).then(resp => {
        return (
          resp ||
          fetch(event.request).then(response => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
        );
      })
    );
  }
});
