// EvaVision Service Worker
const CACHE_NAME = 'evavision-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.warn('[SW] Cache failed:', err))
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip API calls (they should always go to network)
    if (url.hostname.includes('ngrok') ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1') {
        return;
    }

    // For static assets, try cache first
    if (STATIC_ASSETS.some(asset => request.url.includes(asset)) ||
        request.destination === 'style' ||
        request.destination === 'font') {
        event.respondWith(
            caches.match(request)
                .then(cached => {
                    if (cached) return cached;
                    return fetch(request)
                        .then(response => {
                            if (response.ok) {
                                const clone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(request, clone));
                            }
                            return response;
                        });
                })
        );
        return;
    }

    // For everything else, network first with cache fallback
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok && request.url.startsWith('http')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
