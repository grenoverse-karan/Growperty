// Keeps files a user has picked in a form (photos, brochure, documents…) in
// IndexedDB, so a page reload — or a hot update while developing — doesn't
// throw them away. localStorage can't hold files; IndexedDB can store File
// objects as they are. Every call swallows its errors: if IndexedDB is
// unavailable (private mode, quota) the form just behaves as it did before.
const DB_NAME = 'growperty-drafts';
const STORE = 'files';

const openDb = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => req.result.createObjectStore(STORE);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const run = async (mode, fn) => {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, mode);
      const result = fn(tx.objectStore(STORE));
      tx.oncomplete = () => { db.close(); resolve(result?.result); };
      tx.onerror = tx.onabort = () => { db.close(); resolve(undefined); };
    });
  } catch {
    return undefined;
  }
};

export const saveDraftFiles = (key, value) => run('readwrite', (store) => store.put(value, key));
export const loadDraftFiles = (key) => run('readonly', (store) => store.get(key));
export const clearDraftFiles = (key) => run('readwrite', (store) => store.delete(key));
