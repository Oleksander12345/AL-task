import type { LogEntry } from "../types/experiment";

const DB_NAME = "ExperimentDB";
const STORE_NAME = "Logs";
const DB_VERSION = 2;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const saveLogData = (data: LogEntry[]): Promise<void> => {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(data, "logData");

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
};

export const loadLogData = (): Promise<LogEntry[] | null> => {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get("logData");

      getRequest.onsuccess = () => {
        resolve(getRequest.result ?? null);
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  });
};
