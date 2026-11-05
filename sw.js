const CACHE_NAME = 'amina-aac-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/aac-theme.css',
  './js/aac-audio.js',
  './js/aac-data.js',
  './js/phonics-data.js',
  './js/food-wheel.js',
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
