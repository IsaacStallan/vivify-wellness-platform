// Service Worker for Student Wellness Hub PWA
const CACHE_NAME = 'wellness-hub-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/login.html',
  '/signup.html',
  '/profile.html',
  '/mental-health.html',
  '/fitness.html',
  '/nutrition.html',
  '/life-lessons.html',
  '/sleep.html',
  '/guided-meditation-focus.html',
  '/offline.html',
  '/styles.css',
  '/script.js',
  '/auth-utils.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// URLs that should always be fetched from network (API calls, dynamic content)
const NETWORK_ONLY_URLS = [
  '/auth/',
  '/api/',
  '/login',
  '/signup',
  '/logout'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests with caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Network-only requests (authentication, API calls)
  if (NETWORK_ONLY_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If network fails for critical requests, show offline page
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        })
    );
    return;
  }
  
  // Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If successful, cache the response and return it
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache first, then offline page
          return caches.match(request)
            .then(cachedResponse => {
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Static resources (CSS, JS, images) - Cache First strategy
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then(response => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }
  
  // Default: Network First strategy for other requests
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful GET requests
        if (request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request);
      })
  );
});

// Handle background sync for offline data
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'wellness-data-sync') {
    event.waitUntil(syncWellnessData());
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'wellness-notification',
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/open-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-96x96.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync wellness data when back online
async function syncWellnessData() {
  try {
    // Get stored offline data
    const cache = await caches.open(CACHE_NAME);
    const offlineData = await cache.match('/offline-data');
    
    if (offlineData) {
      const data = await offlineData.json();
      
      // Send data to server
      const response = await fetch('/api/sync-wellness-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Remove offline data after successful sync
        await cache.delete('/offline-data');
        console.log('Wellness data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync wellness data:', error);
    throw error; // This will retry the sync later
  }
}

// Update cache version when new version is available
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});