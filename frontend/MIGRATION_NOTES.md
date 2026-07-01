# Mise à jour Frontend - Intégration Admin Dashboard

## Changements apportés

### 📁 Structure des fichiers ajoutés

```
frontend/
├── lib/
│   ├── db/
│   │   ├── index.js              # Dexie IndexedDB setup + CRUD helpers
│   │   └── syncEngine.js         # Offline→server sync engine
│   ├── api/
│   │   └── client.js             # Axios client + JWT refresh interceptor
│   └── store/
│       └── useProductStore.ts    # Zustand stores (Products, Sync, Auth)
├── app/
│   ├── admin/
│   │   └── components/
│   │       ├── ProductForm.tsx   # Full product form (drag&drop, categories, characteristics)
│   │       └── SyncBanner.tsx    # Offline/sync status indicator
│   └── auth/
│       └── register/
│           └── page.tsx          # Double OTP registration (email + SMS)
└── .env.example                  # Environment variables template
```

### 🎯 Fonctionnalités principales

#### 1. **Offline Support avec IndexedDB (Dexie)**
- Les produits sont sauvegardés localement d'abord
- Queue de synchronisation automatique au retour de la connexion
- Mode offline transparent pour l'utilisateur

#### 2. **Formulaire produit complet**
- Upload d'images (Cloudinary ou URL)
- Gestion des catégories et sous-catégories
- Caractéristiques techniques dynamiques
- Validation avec Zod + React Hook Form

#### 3. **Authentification double OTP**
- Vérification par email (6 chiffres)
- Vérification par SMS (6 chiffres)
- Processus multi-étapes avec UI indicatrice

#### 4. **Synchronisation intelligente**
- Auto-sync au retour online
- Retry automatique avec gestion des erreurs
- Progression visible via SyncBanner

### 📦 Dépendances à ajouter

```bash
npm install dexie zustand react-hook-form @hookform/resolvers zod react-dropzone axios
```

### ⚙️ Configuration requise

Créez un fichier `.env.local` à la racine du projet frontend:

```env
NEXT_PUBLIC_API_URL=https://api.tonsite.ci/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=your_upload_preset
```

### 🔗 Points d'intégration

1. **Dans `app/layout.tsx`** - Initialiser les stores:
```tsx
import { useAuthStore } from '@/lib/store/useProductStore'
import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])
  
  return <>{children}</>
}
```

2. **Dans les pages admin** - Importer les composants:
```tsx
import ProductForm from '@/app/admin/components/ProductForm'
import SyncBanner from '@/app/admin/components/SyncBanner'
```

### 🔄 Flux de synchronisation

```
1. Admin ajoute produit → Stockage IndexedDB (Dexie)
2. Item ajouté à syncQueue (status: pending)
3. Connexion retrouvée → syncPendingItems() déclenchée
4. Chaque item envoyé à l'API (FIFO)
5. Succès → syncStatus: synced
6. SyncBanner affiche la progression
```

### 🧪 Tester le mode offline

1. Ouvrir DevTools (F12)
2. Aller à Network > Throttling > Offline
3. Ajouter un produit - il sera sauvegardé localement
4. Passer online - la synchronisation se déclenche automatiquement

### 📝 Notes importantes

- Les fichiers TypeScript utilisent des interfaces pour la typage strict
- Le support de `window` est géré (SSR-safe) dans les intercepteurs
- Les images peuvent être uploadées à Cloudinary ou via URL
- La queue de sync persiste même après fermeture du navigateur

### 🔐 Sécurité

- JWT tokens stockés dans localStorage
- Refresh token automatique sur 401
- Validation Zod sur tous les formulaires
- CORS configuré côté serveur

### 📖 Prochaines étapes

- [ ] Implémenter les endpoints backend manquants (`/auth/register`, `/auth/verify-*`, `/products`)
- [ ] Configurer Cloudinary dans `.env.local`
- [ ] Ajouter des tests pour les stores Zustand
- [ ] Implémenter la pagination pour la liste de produits
- [ ] Ajouter la gestion des images multiples par produit
