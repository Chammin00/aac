const CACHE_NAME = 'amina-aac-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/aac-theme.css',
  './js/aac-audio.js',
  './js/aac-data.js',
  './js/phonics-data.js',
  './js/food-wheel.js',
  './js/favorites-engine.js',
  './js/device-engine.js',
  './js/aac-app.js',
  './manifest.json',
  './assets/amina-avatar.svg',
  './read-for-me.html',
  './css/game-hud.css',
  './js/dictionary-engine.js',
  './js/ocr-engine.js',
  './js/translator-engine.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request).then((res) => res || caches.match('./index.html')))
  );
});
