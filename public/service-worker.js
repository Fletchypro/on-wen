/* eslint-disable no-restricted-globals */

// Cache version - update this to invalidate old caches
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const GOOGLE_STORAGE_CACHE = `gstorage-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
  // Note: We don't hardcode hashed JS/CSS here because names change every build.
  // The service worker will cache them dynamically as they are requested.
];

// Install Event: Pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Precaching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== IMAGE_CACHE && key !== DYNAMIC_CACHE && key !== GOOGLE_STORAGE_CACHE) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
          return null;
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event: Implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  // 2. Ignore chrome-extension schemes or other non-http protocols
  if (!url.protocol.startsWith('http')) return;

  // 3. New Strategy: Stale-While-Revalidate for Google Storage Images
  // Matches storage.googleapis.com domain
  if (url.hostname === 'storage.googleapis.com' && url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) {
    event.respondWith(
      caches.open(GOOGLE_STORAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        
        // Fetch fresh content in the background to update cache
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
           // Network failure - silently fail update, rely on cache if available
           return null;
        });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Strategy: Stale-While-Revalidate for other Images (e.g. Supabase storage)
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
             // Fallback or just fail for images
             return null;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 5. Strategy: Network First for HTML (Navigation) to ensure fresh app shell references
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 6. Strategy: Cache First, Fallback to Network for JS/CSS/Fonts (Immutable Assets)
  // Vite generates hashed filenames, so if it's in cache, it's valid.
  if (
    url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|ico)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network Only
});