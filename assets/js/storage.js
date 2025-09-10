// /js/storage.js

const DB_NAME = "ganadoDB";
const DB_VERSION = 1;
const STORE_NAME = "registro_ganado";

let db;

// 🔹 Abrir o crear base de datos
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error al abrir IndexedDB");
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    // Crear almacenes al iniciar la DB
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

// 🔹 Guardar datos (sobreescribe todo el registro actual)
export async function guardarData(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Limpiar primero
    store.clear().onsuccess = () => {
      store.add({ id: 1, ...data }); // Guardamos bajo la clave 1
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject("Error al guardar datos en IndexedDB");
  });
}

// 🔹 Leer datos
export async function cargarData() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(1);

    request.onsuccess = () => resolve(request.result || { fincas: [] });
    request.onerror = () => reject("Error al cargar datos");
  });
}
