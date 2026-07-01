// lib/db/syncEngine.js
// Moteur de synchronisation offline → serveur
// S'active automatiquement quand la connexion revient

import { db, getPendingCount } from './index.js'
import api from '../api/client.js'

let isSyncing = false

/**
 * Synchronise tous les éléments en attente vers le serveur.
 * Appelé automatiquement via l'event 'online' + interval de 30s.
 */
export async function syncPendingItems(onProgress) {
  if (isSyncing || !navigator.onLine) return
  isSyncing = true

  try {
    const queue = await db.syncQueue.orderBy('createdAt').toArray()
    if (queue.length === 0) { isSyncing = false; return }

    let done = 0
    onProgress?.({ total: queue.length, done: 0, status: 'syncing' })

    for (const item of queue) {
      try {
        if (item.entityType === 'product') {
          await syncProductItem(item)
        }
        await db.syncQueue.delete(item.id)
        done++
        onProgress?.({ total: queue.length, done, status: 'syncing' })
      } catch (err) {
        console.error('Sync error for item', item.id, err)
        // On continue avec les autres items — on ne bloque pas sur une erreur
      }
    }

    onProgress?.({ total: queue.length, done, status: 'done' })
  } finally {
    isSyncing = false
  }
}

async function syncProductItem(queueItem) {
  const { entityLocalId, operation, serverId } = queueItem
  const product = await db.products.where('localId').equals(entityLocalId).first()

  if (operation === 'create' && product) {
    const { data } = await api.post('/products', serializeProduct(product))
    // On mémorise le serverId reçu et on passe à 'synced'
    await db.products
      .where('localId')
      .equals(entityLocalId)
      .modify({ serverId: data.id, syncStatus: 'synced' })
  }

  if (operation === 'update' && product) {
    const sid = product.serverId
    if (!sid) return // pas encore créé côté serveur, sera inclus dans le 'create'
    await api.put(`/products/${sid}`, serializeProduct(product))
    await db.products
      .where('localId')
      .equals(entityLocalId)
      .modify({ syncStatus: 'synced' })
  }

  if (operation === 'delete' && serverId) {
    await api.delete(`/products/${serverId}`)
  }
}

function serializeProduct(p) {
  return {
    name: p.name,
    description: p.description,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    promo_price: p.promoPrice ?? null,
    stock: p.stock,
    image_url: p.imageUrl ?? null,
    characteristics: p.characteristics ?? {}
  }
}

/**
 * Initialise les listeners online/offline.
 * À appeler une seule fois au démarrage de l'app (dans App.jsx).
 */
export function initSyncListeners(setSyncState) {
  window.addEventListener('online', () => {
    setSyncState(s => ({ ...s, isOnline: true }))
    syncPendingItems(({ total, done, status }) => {
      setSyncState({ isOnline: true, isSyncing: status === 'syncing', total, done })
    })
  })

  window.addEventListener('offline', () => {
    setSyncState(s => ({ ...s, isOnline: false }))
  })

  // Sync périodique toutes les 30 secondes si en ligne
  setInterval(() => {
    if (navigator.onLine) {
      syncPendingItems(({ total, done, status }) => {
        setSyncState({ isOnline: true, isSyncing: status === 'syncing', total, done })
      })
    }
  }, 30_000)
}
