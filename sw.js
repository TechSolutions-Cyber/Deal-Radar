const CACHE = 'dealradar-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.svg', '/icon-512.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('push', e => {
  e.waitUntil(self.registration.showNotification('Deal Radar', {
    body: e.data ? e.data.text() : 'Neue Angebote verfügbar!',
    icon: '/icon.png',
    badge: '/icon.png'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  clients.openWindow('/');
});
