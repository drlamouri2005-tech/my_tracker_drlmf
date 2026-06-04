// Lightweight IndexedDB helper for storing user audio blobs.
const DB_NAME = 'medverse-tracks';
const STORE_NAME = 'tracks';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function saveTrackBlob(id: string, blob: Blob) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const r = store.put(blob, id);
      r.onsuccess = () => {
        resolve();
        db.close();
      };
      r.onerror = () => {
        reject(r.error);
        db.close();
      };
    } catch (e) {
      reject(e);
      try {
        db.close();
      } catch {}
    }
  });
}

export async function getTrackBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const r = store.get(id);
      r.onsuccess = () => {
        resolve(r.result ?? null);
        db.close();
      };
      r.onerror = () => {
        reject(r.error);
        db.close();
      };
    } catch (e) {
      reject(e);
      try {
        db.close();
      } catch {}
    }
  });
}

export async function deleteTrackBlob(id: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const r = store.delete(id);
      r.onsuccess = () => {
        resolve();
        db.close();
      };
      r.onerror = () => {
        reject(r.error);
        db.close();
      };
    } catch (e) {
      reject(e);
      try {
        db.close();
      } catch {}
    }
  });
}
