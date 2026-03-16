// Service Worker registration utility

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registrato:', registration);
          
          // Richiedi background sync se supportato
          if ('sync' in registration) {
            registration.sync.register('sync-interventions');
          }
          
          // Notifiche push (futuro)
          if ('pushManager' in registration) {
            console.log('Push notifications supportate');
          }
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    });
  } else {
    console.log('Service Worker non supportato');
  }
}

// Richiede sync manuale (per invio dati offline)
export async function requestSync() {
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-interventions');
      console.log('Sync richiesto');
    } catch (error) {
      console.error('Sync fallito:', error);
    }
  }
}

// Controlla stato connessione
export function isOnline() {
  return navigator.onLine;
}

// Listener per cambio stato connessione
export function onConnectionChange(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}
