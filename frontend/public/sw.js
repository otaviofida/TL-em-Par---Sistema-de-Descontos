const CACHE_NAME = 'tlempar-v3';
const OFFLINE_URL = '/offline.html';

// Assets estáticos para pre-cache
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/icons/icon-192x192.png?v=2',
  '/icons/icon-512x512.png?v=2',
  '/manifest.json',
];

// Install: pre-cacheia assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: NetworkFirst para API, CacheFirst para assets estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-GET
  if (request.method !== 'GET') return;

  // Ignorar requests para outros domínios (ex: Stripe, Typekit)
  if (url.origin !== self.location.origin) return;

  // API: NetworkFirst — tenta rede, fallback para cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cacheia respostas GET da API que foram OK
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Assets estáticos (JS, CSS, imagens): CacheFirst
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Páginas HTML: NetworkFirst com fallback offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const options = {
      body: payload.message || '',
      icon: '/icons/icon-192x192.png?v=2',
      badge: '/icons/icon-192x192.png?v=2',
      vibrate: [100, 50, 100],
      data: { url: payload.url || '/' },
      actions: [{ action: 'open', title: 'Abrir' }],
    };

    event.waitUntil(
      self.registration.showNotification(payload.title || 'TL em Par', options)
    );
  } catch (err) {
    console.error('[SW] Erro ao processar push:', err);
  }
});

// Notification click — abre a URL do payload
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Se já tem uma aba aberta, foca nela e navega
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Senão abre nova aba
      return self.clients.openWindow(url);
    })
  );
});
