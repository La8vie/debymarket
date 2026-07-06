import { create } from 'zustand';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
  createdAt?: string;
}

interface SyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  product: Product;
  timestamp: number;
  synced: boolean;
}

interface ProductStore {
  products: Product[];
  syncQueue: SyncItem[];
  isOnline: boolean;
  isInitialized: boolean;
  db: IDBPDatabase<ProductDB> | null;

  // Actions
  initDB: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProducts: () => Promise<Product[]>;
  syncWithServer: (apiUrl: string) => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
}

interface ProductDB extends DBSchema {
  products: {
    key: string;
    value: Product;
  };
  syncQueue: {
    key: string;
    value: SyncItem;
  };
}

const DB_VERSION = 1;
const DB_NAME = 'debymarket-db';

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  syncQueue: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isInitialized: false,
  db: null,

  /**
   * Initialiser IndexedDB
   */
  initDB: async () => {
    try {
      const db = await openDB<ProductDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('products')) {
            db.createObjectStore('products', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' });
          }
        },
      });

      set({ db, isInitialized: true });

      // Charger les produits existants
      const products = await db.getAll('products');
      set({ products });

      // Charger la queue de synchronisation
      const syncQueue = await db.getAll('syncQueue');
      set({ syncQueue });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
  },

  /**
   * Ajouter un produit
   */
  addProduct: async (product: Product) => {
    const { db, isOnline } = get();
    if (!db) return;

    try {
      // Ajouter à la base locale
      await db.put('products', product);

      // Ajouter à la queue si offline
      if (!isOnline) {
        const syncItem: SyncItem = {
          id: `sync-${Date.now()}`,
          type: 'create',
          product,
          timestamp: Date.now(),
          synced: false,
        };
        await db.put('syncQueue', syncItem);
        set((state) => ({ syncQueue: [...state.syncQueue, syncItem] }));
      }

      set((state) => ({
        products: [...state.products, product],
      }));
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
    }
  },

  /**
   * Mettre à jour un produit
   */
  updateProduct: async (product: Product) => {
    const { db, isOnline } = get();
    if (!db) return;

    try {
      await db.put('products', product);

      if (!isOnline) {
        const syncItem: SyncItem = {
          id: `sync-${Date.now()}`,
          type: 'update',
          product,
          timestamp: Date.now(),
          synced: false,
        };
        await db.put('syncQueue', syncItem);
        set((state) => ({
          syncQueue: [...state.syncQueue, syncItem],
        }));
      }

      set((state) => ({
        products: state.products.map((p) =>
          p.id === product.id ? product : p,
        ),
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
    }
  },

  /**
   * Supprimer un produit
   */
  deleteProduct: async (id: string) => {
    const { db, isOnline } = get();
    if (!db) return;

    try {
      const product = get().products.find((p) => p.id === id);
      if (!product) return;

      await db.delete('products', id);

      if (!isOnline) {
        const syncItem: SyncItem = {
          id: `sync-${Date.now()}`,
          type: 'delete',
          product,
          timestamp: Date.now(),
          synced: false,
        };
        await db.put('syncQueue', syncItem);
        set((state) => ({
          syncQueue: [...state.syncQueue, syncItem],
        }));
      }

      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
    }
  },

  /**
   * Récupérer tous les produits
   */
  getProducts: async () => {
    const { db } = get();
    if (!db) return [];

    try {
      const products = await db.getAll('products');
      return products;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return [];
    }
  },

  /**
   * Synchroniser avec le serveur
   */
  syncWithServer: async (apiUrl: string) => {
    const { db, syncQueue } = get();
    if (!db || syncQueue.length === 0) return;

    try {
      for (const item of syncQueue) {
        try {
          if (item.type === 'create') {
            await fetch(`${apiUrl}/products`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(item.product),
            });
          } else if (item.type === 'update') {
            await fetch(`${apiUrl}/products/${item.product.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(item.product),
            });
          } else if (item.type === 'delete') {
            await fetch(`${apiUrl}/products/${item.product.id}`, {
              method: 'DELETE',
              credentials: 'include',
            });
          }

          // Marquer comme synchronisé
          await db.delete('syncQueue', item.id);
          set((state) => ({
            syncQueue: state.syncQueue.filter((i) => i.id !== item.id),
          }));
        } catch (error) {
          console.error(`Erreur lors de la synchronisation de ${item.type}:`, error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  },

  /**
   * Définir le statut online/offline
   */
  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });

    if (isOnline) {
      // Synchroniser quand la connexion revient
      const { syncWithServer } = get();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      syncWithServer(apiUrl);
    }
  },
}));
