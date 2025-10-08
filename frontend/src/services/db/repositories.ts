import { getDB } from './index';
import type { Cliente, Recomendacion, QueueItem } from '@/types';

// ==================== Clientes ====================

export async function getCliente(id: string): Promise<Cliente | undefined> {
  const db = await getDB();
  return await db.get('Clientes', id);
}

export async function getAllClientes(): Promise<Cliente[]> {
  const db = await getDB();
  return await db.getAll('Clientes');
}

export async function saveCliente(cliente: Cliente): Promise<void> {
  const db = await getDB();
  await db.put('Clientes', cliente);
}

export async function saveClientes(clientes: Cliente[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('Clientes', 'readwrite');
  await Promise.all(clientes.map((cliente) => tx.store.put(cliente)));
  await tx.done;
}

// ==================== Recomendaciones ====================

export async function getRecomendacion(id: string): Promise<Recomendacion | undefined> {
  const db = await getDB();
  return await db.get('Recomendaciones', id);
}

export async function getRecomendacionesByCliente(clienteId: string): Promise<Recomendacion[]> {
  const db = await getDB();
  return await db.getAllFromIndex('Recomendaciones', 'clienteId', clienteId);
}

export async function saveRecomendacion(recomendacion: Recomendacion): Promise<void> {
  const db = await getDB();
  await db.put('Recomendaciones', recomendacion);
}

export async function saveRecomendaciones(recomendaciones: Recomendacion[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('Recomendaciones', 'readwrite');
  await Promise.all(recomendaciones.map((rec) => tx.store.put(rec)));
  await tx.done;
}

// ==================== Queue Items ====================

type QueueStore = 'FeedbackPendiente' | 'InventarioPendiente' | 'QuiebresPendientes' | 'CierresPendientes';

export async function addToQueue<T>(
  store: QueueStore,
  item: QueueItem<T>
): Promise<void> {
  const db = await getDB();
  await db.add(store, item as never);
}

export async function getQueueItem<T>(
  store: QueueStore,
  id: string
): Promise<QueueItem<T> | undefined> {
  const db = await getDB();
  return (await db.get(store, id)) as QueueItem<T> | undefined;
}

export async function getPendingQueueItems<T>(
  store: QueueStore
): Promise<QueueItem<T>[]> {
  const db = await getDB();
  const items = await db.getAllFromIndex(store, 'estado', 'pending');
  return items as QueueItem<T>[];
}

export async function getRetryableQueueItems<T>(
  store: QueueStore,
  now: string
): Promise<QueueItem<T>[]> {
  const db = await getDB();
  const tx = db.transaction(store, 'readonly');
  const index = tx.store.index('proximoReintento');
  const items: QueueItem<T>[] = [];

  let cursor = await index.openCursor();
  while (cursor) {
    const item = cursor.value as QueueItem<T>;
    if (
      item.status === 'pending' &&
      item.nextRetry &&
      item.nextRetry <= now
    ) {
      items.push(item);
    }
    cursor = await cursor.continue();
  }

  await tx.done;
  return items;
}

export async function updateQueueItem<T>(
  store: QueueStore,
  item: QueueItem<T>
): Promise<void> {
  const db = await getDB();
  await db.put(store, item as never);
}

export async function deleteQueueItem(
  store: QueueStore,
  id: string
): Promise<void> {
  const db = await getDB();
  await db.delete(store, id);
}

export async function getQueueItemCount(store: QueueStore): Promise<number> {
  const db = await getDB();
  return await db.count(store);
}

// ==================== Configuracion ====================

export async function getConfig(key: string): Promise<unknown> {
  const db = await getDB();
  const config = await db.get('Configuracion', key);
  return config?.valor;
}

export async function setConfig(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('Configuracion', {
    clave: key,
    valor: value,
    actualizadoEn: new Date().toISOString(),
  });
}

export async function deleteConfig(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('Configuracion', key);
}

// ==================== Plan de Ruta ====================

export async function getPlanDeRuta(fecha: string): Promise<{
  id: string;
  fecha: string;
  asesorId: string;
  clientes: string[];
  metadata: { sincronizadoEn: string; version: number };
} | undefined> {
  const db = await getDB();
  return await db.getFromIndex('PlanDeRuta', 'fecha', fecha);
}

export async function savePlanDeRuta(plan: {
  id: string;
  fecha: string;
  asesorId: string;
  clientes: string[];
  metadata: { sincronizadoEn: string; version: number };
}): Promise<void> {
  const db = await getDB();
  await db.put('PlanDeRuta', plan);
}
