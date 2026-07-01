// lib/db/index.js
// Base de données locale IndexedDB via Dexie
// Tous les ajouts passent ici en premier, puis sont synchronisés vers le serveur

import Dexie from 'dexie'

export const db = new Dexie('AdminShopDB')

db.version(1).stores({
  // ++ = clé auto-incrémentée, & = unique, * = indexé
  products:
    '++id, &localId, serverId, name, category, subcategory, price, promoPrice, stock, syncStatus, createdAt, updatedAt',
  // syncStatus: 'pending' | 'synced' | 'error'
  // serverId: null tant que non synchronisé

  syncQueue:
    '++id, entityType, entityLocalId, operation, createdAt',
  // operation: 'create' | 'update' | 'delete'

  orders:
    '++id, serverId, status, createdAt',

  settings:
    'key'
})

// ─── Helpers produits ───────────────────────────────────────

/** Ajoute un produit localement et le met en queue de sync */
export async function addProductLocally(data) {
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const product = {
    ...data,
    localId,
    serverId: null,
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const id = await db.products.add(product)

  await db.syncQueue.add({
    entityType: 'product',
    entityLocalId: localId,
    operation: 'create',
    createdAt: new Date().toISOString()
  })

  return { id, localId }
}

/** Met à jour un produit localement */
export async function updateProductLocally(localId, data) {
  await db.products
    .where('localId')
    .equals(localId)
    .modify({ ...data, syncStatus: 'pending', updatedAt: new Date().toISOString() })

  const existing = await db.syncQueue
    .where({ entityLocalId: localId, operation: 'create' })
    .first()

  // Si déjà en queue de création, pas besoin d'ajouter un update
  if (!existing) {
    await db.syncQueue.add({
      entityType: 'product',
      entityLocalId: localId,
      operation: 'update',
      createdAt: new Date().toISOString()
    })
  }
}

/** Supprime un produit localement */
export async function deleteProductLocally(localId) {
  const product = await db.products.where('localId').equals(localId).first()
  await db.products.where('localId').equals(localId).delete()

  if (product?.serverId) {
    // Seulement si déjà sur le serveur
    await db.syncQueue.add({
      entityType: 'product',
      entityLocalId: localId,
      operation: 'delete',
      serverId: product.serverId,
      createdAt: new Date().toISOString()
    })
  }
}

/** Récupère tous les produits locaux */
export async function getAllProducts() {
  return db.products.orderBy('createdAt').reverse().toArray()
}

/** Compte les items en attente de sync */
export async function getPendingCount() {
  return db.products.where('syncStatus').equals('pending').count()
}
