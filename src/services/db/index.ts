import { openDB, IDBPDatabase } from 'idb';
import { logger } from '@/utils/logger';
import type {
  Cliente,
  Recomendacion,
  Feedback,
  Inventario,
  Quiebre,
  CierreVisita,
  QueueItem,
} from '@/types';

const DB_NAME = 'webpv-db';
const DB_VERSION = 1;

export interface WebPVDB {
  // Synchronized data
  PlanDeRuta: {
    key: string;
    value: {
      id: string;
      fecha: string;
      asesorId: string;
      clientes: string[];
      metadata: {
        sincronizadoEn: string;
        version: number;
      };
    };
    indexes: { fecha: string };
  };

  Clientes: {
    key: string;
    value: Cliente;
    indexes: { codigo: string };
  };

  Recomendaciones: {
    key: string;
    value: Recomendacion;
    indexes: { clienteId: string; prioridad: string };
  };

  // Offline queue
  FeedbackPendiente: {
    key: string;
    value: QueueItem<Feedback>;
    indexes: { estado: string; proximoReintento: string };
  };

  InventarioPendiente: {
    key: string;
    value: QueueItem<Inventario>;
    indexes: { estado: string; proximoReintento: string };
  };

  QuiebresPendientes: {
    key: string;
    value: QueueItem<Quiebre>;
    indexes: { estado: string; proximoReintento: string };
  };

  CierresPendientes: {
    key: string;
    value: QueueItem<CierreVisita>;
    indexes: { estado: string; proximoReintento: string };
  };

  // Configuration
  Configuracion: {
    key: string;
    value: {
      clave: string;
      valor: unknown;
      actualizadoEn: string;
    };
  };
}

let dbInstance: IDBPDatabase<WebPVDB> | null = null;

/**
 * Initialize the database with versioned schema
 */
export async function initDB(): Promise<IDBPDatabase<WebPVDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB<WebPVDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        logger.info('Upgrading database', { oldVersion, newVersion });

        // Version 1: Initial schema
        if (oldVersion < 1) {
          // PlanDeRuta
          const planDeRutaStore = db.createObjectStore('PlanDeRuta', { keyPath: 'id' });
          planDeRutaStore.createIndex('fecha', 'fecha', { unique: true });

          // Clientes
          const clientesStore = db.createObjectStore('Clientes', { keyPath: 'id' });
          clientesStore.createIndex('codigo', 'codigo', { unique: true });

          // Recomendaciones
          const recomendacionesStore = db.createObjectStore('Recomendaciones', { keyPath: 'id' });
          recomendacionesStore.createIndex('clienteId', 'clienteId');
          recomendacionesStore.createIndex('prioridad', 'prioridad');

          // FeedbackPendiente
          const feedbackStore = db.createObjectStore('FeedbackPendiente', { keyPath: 'id' });
          feedbackStore.createIndex('estado', 'status');
          feedbackStore.createIndex('proximoReintento', 'nextRetry');

          // InventarioPendiente
          const inventarioStore = db.createObjectStore('InventarioPendiente', { keyPath: 'id' });
          inventarioStore.createIndex('estado', 'status');
          inventarioStore.createIndex('proximoReintento', 'nextRetry');

          // QuiebresPendientes
          const quiebresStore = db.createObjectStore('QuiebresPendientes', { keyPath: 'id' });
          quiebresStore.createIndex('estado', 'status');
          quiebresStore.createIndex('proximoReintento', 'nextRetry');

          // CierresPendientes
          const cierresStore = db.createObjectStore('CierresPendientes', { keyPath: 'id' });
          cierresStore.createIndex('estado', 'status');
          cierresStore.createIndex('proximoReintento', 'nextRetry');

          // Configuracion
          db.createObjectStore('Configuracion', { keyPath: 'clave' });

          logger.info('Database schema v1 created');
        }

        // Future migrations go here
        // if (oldVersion < 2) { ... }
      },
      blocked() {
        logger.warn('Database upgrade blocked by another tab');
      },
      blocking() {
        logger.warn('This tab is blocking a database upgrade');
        // Close database to allow upgrade
        if (dbInstance) {
          dbInstance.close();
          dbInstance = null;
        }
      },
      terminated() {
        logger.error('Database connection terminated unexpectedly');
        dbInstance = null;
      },
    });

    logger.info('Database initialized', { version: DB_VERSION });
    return dbInstance;
  } catch (error) {
    logger.error('Failed to initialize database', { error });
    throw error;
  }
}

/**
 * Get database instance (initializes if needed)
 */
export async function getDB(): Promise<IDBPDatabase<WebPVDB>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    logger.info('Database connection closed');
  }
}

/**
 * Clear all data from database (for testing or logout)
 */
export async function clearDB(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    [
      'PlanDeRuta',
      'Clientes',
      'Recomendaciones',
      'FeedbackPendiente',
      'InventarioPendiente',
      'QuiebresPendientes',
      'CierresPendientes',
      'Configuracion',
    ],
    'readwrite'
  );

  await Promise.all([
    tx.objectStore('PlanDeRuta').clear(),
    tx.objectStore('Clientes').clear(),
    tx.objectStore('Recomendaciones').clear(),
    tx.objectStore('FeedbackPendiente').clear(),
    tx.objectStore('InventarioPendiente').clear(),
    tx.objectStore('QuiebresPendientes').clear(),
    tx.objectStore('CierresPendientes').clear(),
    tx.objectStore('Configuracion').clear(),
  ]);

  await tx.done;
  logger.info('Database cleared');
}

/**
 * Delete database completely
 */
export async function deleteDB(): Promise<void> {
  closeDB();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      logger.info('Database deleted');
      resolve();
    };
    request.onerror = () => {
      logger.error('Failed to delete database', { error: request.error });
      reject(request.error);
    };
  });
}
