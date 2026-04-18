const CACHE_NAME = 'my-clinic-pwa-v1.0.1'; // 🚨 Bumped version to force update

// 1. INSTALL: Safely cache ONLY guaranteed files. Never hardcode hashed JS/CSS here.
self.addEventListener('install', event => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/favicon.ico'
            ]);
        })
    );
});

// 2. ACTIVATE: Immediately claim clients and wipe out old, stale caches to save user storage.
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME)
                          .map(cache => caches.delete(cache))
            );
        })
    );
});

// 3. FETCH: Smart routing & dynamic caching
self.addEventListener('fetch', event => {
    // Ignore non-GET requests (POST/PUT/DELETE are handled by your IndexedDB sync queue)
    if (event.request.method !== 'GET') return;

    // 🚨 FIX 1: Ignore ALL backend API calls. Let Axios and Dexie handle these.
    if (event.request.url.includes('/api/')) {
        return; 
    }

    // --- A. SPA NAVIGATION (React Router Fallback) ---
    // If the browser is asking for a new page route (like /doctor-patient)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Offline? Serve index.html so React Router handles the UI
                return caches.match('/index.html').then(res => res || caches.match('/'));
            })
        );
        return; // Exit early for navigations
    }

    // --- B. DYNAMIC ASSETS (JS, CSS, Images) ---
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Ensure the response is valid before caching it
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                // Clone and dynamically cache the new asset
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                // 🚨 FIX 2: Prevent the "Failed to convert value to 'Response'" crash
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback to prevent crash if an asset is completely missing
                    return new Response('Offline and not in cache', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({ 'Content-Type': 'text/plain' })
                    });
                });
            })
    );
});