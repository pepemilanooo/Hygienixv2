// IndexedDB wrapper per sincronizzazione offline
class OfflineDB {
  constructor() {
    this.dbName = 'hygienix-offline-v2';
    this.dbVersion = 1;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store per interventi
        if (!db.objectStoreNames.contains('interventions')) {
          const interventionStore = db.createObjectStore('interventions', { keyPath: 'id' });
          interventionStore.createIndex('status', 'status', { unique: false });
          interventionStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        // Store per dati pendenti da sync
        if (!db.objectStoreNames.contains('pendingSync')) {
          db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        }
        
        // Store per foto locali
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      };
    });
  }

  // Salva interventi per accesso offline
  async saveInterventions(interventions) {
    const db = await this.openDB();
    const tx = db.transaction('interventions', 'readwrite');
    const store = tx.objectStore('interventions');
    
    for (const intervention of interventions) {
      await store.put({ ...intervention, lastUpdated: Date.now() });
    }
    
    return tx.complete;
  }

  // Recupera interventi locali
  async getInterventions(status = null) {
    const db = await this.openDB();
    const tx = db.transaction('interventions', 'readonly');
    const store = tx.objectStore('interventions');
    
    if (status) {
      const index = store.index('status');
      return index.getAll(status);
    }
    
    return store.getAll();
  }

  // Aggiungi operazione pendente per sync
  async addPendingSync(operation) {
    const db = await this.openDB();
    const tx = db.transaction('pendingSync', 'readwrite');
    const store = tx.objectStore('pendingSync');
    
    return store.add({
      ...operation,
      timestamp: Date.now(),
      retries: 0
    });
  }

  // Recupera operazioni pendenti
  async getPendingSync() {
    const db = await this.openDB();
    const tx = db.transaction('pendingSync', 'readonly');
    const store = tx.objectStore('pendingSync');
    return store.getAll();
  }

  // Rimuovi operazione completata
  async removePendingSync(id) {
    const db = await this.openDB();
    const tx = db.transaction('pendingSync', 'readwrite');
    const store = tx.objectStore('pendingSync');
    return store.delete(id);
  }

  // Salva foto localmente
  async savePhoto(id, photoData) {
    const db = await this.openDB();
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    return store.put({ id, data: photoData, timestamp: Date.now() });
  }

  // Verifica se online
  isOnline() {
    return navigator.onLine;
  }

  // Registra per sync quando torna online
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-interventions');
    }
  }
}

export default new OfflineDB();
