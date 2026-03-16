// Registrazione Service Worker
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registrato:', registration);
          
          // Aggiorna quando c'è nuova versione
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuova versione disponibile
                if (confirm('Nuova versione disponibile. Ricaricare?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
};

// Check online/offline status
export const initNetworkStatus = () => {
  const updateOnlineStatus = () => {
    const event = new CustomEvent('networkChange', { 
      detail: { online: navigator.onLine } 
    });
    window.dispatchEvent(event);
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
};
