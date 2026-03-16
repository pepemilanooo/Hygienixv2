// Service Worker Hygienix - Offline First
const CACHE_NAME = 'hygienix-v2-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installazione - caching risorse statiche
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Attivazione - pulizia cache vecchie
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - strategia Network First, fallback su cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip per API calls - gestiti separatamente
  if (request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Risorse statiche - Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      });
    })
  );
});

// Gestione API con IndexedDB fallback
async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);
    const clone = response.clone();
    
    // Salva risposta in cache per uso offline
    const data = await clone.json();
    await saveToIndexedDB(request.url, data);
    
    return response;
  } catch (error) {
    // Offline - recupera da IndexedDB
    const cached = await getFromIndexedDB(request.url);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Nessuna cache disponibile
    return new Response(JSON.stringify({ error: 'Offline, dati non disponibili' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background Sync per invio dati quando torna online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-interventions') {
    event.waitUntil(syncInterventions());
  }
});

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hygienix-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('api-cache')) {
        db.createObjectStore('api-cache', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('pending-sync')) {
        db.createObjectStore('pending-sync', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function saveToIndexedDB(url, data) {
  const db = await openDB();
  const tx = db.transaction('api-cache', 'readwrite');
  const store = tx.objectStore('api-cache');
  await store.put({ url, data, timestamp: Date.now() });
}

async function getFromIndexedDB(url) {
  const db = await openDB();
  const tx = db.transaction('api-cache', 'readonly');
  const store = tx.objectStore('api-cache');
  const result = await store.get(url);
  return result?.data;
}

async function syncInterventions() {
  const db = await openDB();
  const tx = db.transaction('pending-sync', 'readonly');
  const store = tx.objectStore('pending-sync');
  const pending = await store.getAll();
  
  for (const item of pending) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body)
      });
      
      if (response.ok) {
        // Rimuovi dalla coda se inviato con successo
        const deleteTx = db.transaction('pending-sync', 'readwrite');
        const deleteStore = deleteTx.objectStore('pending-sync');
        await deleteStore.delete(item.id);
      }
    } catch (error) {
      console.error('Sync failed for item:', item.id);
    }
  }
}
