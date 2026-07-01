// lib/store/useProductStore.ts
'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  getAllProducts,
  addProductLocally,
  updateProductLocally,
  deleteProductLocally,
  getPendingCount
} from '@/lib/db'

interface Product {
  id?: number
  localId: string
  serverId?: string | null
  name: string
  description?: string
  category: string
  subcategory: string
  price: number
  promoPrice?: number | null
  stock: number
  imageUrl?: string | null
  characteristics?: Record<string, string>
  syncStatus: 'pending' | 'synced' | 'error'
  createdAt?: string
  updatedAt?: string
}

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  pendingCount: number
  fetchProducts: () => Promise<void>
  addProduct: (data: Partial<Product>) => Promise<string>
  updateProduct: (localId: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (localId: string) => Promise<void>
  refreshPendingCount: () => Promise<void>
}

export const useProductStore = create<ProductStore>(
  devtools((set, get) => ({
    products: [],
    loading: false,
    error: null,
    pendingCount: 0,

    // ─── Charger les produits depuis IndexedDB ───────────────
    fetchProducts: async () => {
      set({ loading: true })
      try {
        const products = await getAllProducts()
        const pendingCount = await getPendingCount()
        set({ products, pendingCount, loading: false })
      } catch (e: any) {
        set({ error: e.message, loading: false })
      }
    },

    // ─── Ajouter un produit ──────────────────────────────────
    addProduct: async (data) => {
      const { localId } = await addProductLocally(data)
      await get().fetchProducts()
      return localId
    },

    // ─── Modifier un produit ─────────────────────────────────
    updateProduct: async (localId, data) => {
      await updateProductLocally(localId, data)
      await get().fetchProducts()
    },

    // ─── Supprimer un produit ────────────────────────────────
    deleteProduct: async (localId) => {
      await deleteProductLocally(localId)
      await get().fetchProducts()
    },

    // ─── Mettre à jour le compteur pending ───────────────────
    refreshPendingCount: async () => {
      const pendingCount = await getPendingCount()
      set({ pendingCount })
    }
  }))
)

// ─── Store de synchronisation ────────────────────────────────────────────────
interface SyncStore {
  isOnline: boolean
  isSyncing: boolean
  total: number
  done: number
  setSyncState: (updater: SyncStore | ((state: SyncStore) => SyncStore)) => void
}

export const useSyncStore = create<SyncStore>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  total: 0,
  done: 0,

  setSyncState: (updater) =>
    set(typeof updater === 'function' ? updater : updater)
}))

// ─── Store Auth ───────────────────────────────────────────────────────────────
interface AuthStore {
  user: any | null
  token: string | null
  isAuthenticated: boolean
  login: (user: any, token: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>(
  devtools((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    login: (user, token) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token)
      }
      set({ user, token, isAuthenticated: true })
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      set({ user: null, token: null, isAuthenticated: false })
    },

    hydrate: () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) set({ token, isAuthenticated: true })
      }
    }
  }))
)
