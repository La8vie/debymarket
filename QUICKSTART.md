# 🚀 Guide de démarrage rapide - DebyMarket

## ✅ Qu'est-ce qui a été implémenté?

### Backend (NestJS + Prisma)
- ✅ **Schéma Prisma complet** avec modèles pour images, vérification, notifications, sync offline
- ✅ **Authentification améliorée** - Email + SMS obligatoire (double vérification)
- ✅ **Service d'email** - Nodemailer pour envoi de mails de vérification et confirmations
- ✅ **Service SMS** - Twilio pour codes de vérification et notifications
- ✅ **Upload d'images** - Cloudinary pour hébergement sécurisé et optimisé
- ✅ **Gestion des produits** - CRUD complet avec images multiples
- ✅ **Notifications admin** - SSE pour alertes en temps réel sur les commandes
- ✅ **Notifications promotions** - Système anti-spam avec préférences par utilisateur
- ✅ **Synchronisation offline** - Queue pour les actions offline

### Frontend (Next.js + Zustand)
- ✅ **Page d'inscription** - Double vérification (email + SMS) en 3 étapes
- ✅ **Dashboard admin** - Interface fluide et intuitive, zéro code requis
- ✅ **3 catégories** - Électronique ⚡, Électroménager 🍳, Mode 👕
- ✅ **Upload d'images** - URL externe OU fichier local
- ✅ **Store offline** - Zustand + IndexedDB pour sync automatique
- ✅ **Design responsive** - Mobile-first, dark mode, Tailwind CSS
- ✅ **Gestion d'erreurs** - Messages clairs et UX fluide

---

## 🔧 Installation étape par étape

### Prérequis
- Node.js 18+ et npm
- PostgreSQL 14+
- Comptes externes (Twilio, Cloudinary, Gmail)

### 1. Configurer les variables d'environnement

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/debymarket"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"

# Email (Gmail)
MAIL_SERVICE="gmail"
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-16-char-app-password"
MAIL_FROM="noreply@debymarket.com"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Images (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-name"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# URLs
FRONTEND_URL="http://localhost:3001"
PORT=3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 2. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 3. Initialiser la base de données

```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Lancer l'application

**Terminal 1 - Backend**:
```bash
cd backend
npm run start:dev
# Backend tourne sur http://localhost:3000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Frontend tourne sur http://localhost:3001
```

---

## 🎯 Utilisation de l'application

### 1. S'inscrire (`http://localhost:3001/register`)
1. Remplir le formulaire (prénom, nom, email, téléphone)
2. Vérifier l'email (code reçu par mail)
3. Vérifier le téléphone (code reçu par SMS)
4. Redirection vers login

### 2. Tableau de bord admin (`http://localhost:3001/admin/dashboard`)
1. **Sélectionner une catégorie**: Électronique, Électroménager, ou Mode
2. **Cliquer sur "➕ Ajouter un produit"**
3. **Remplir les infos**:
   - Nom du produit
   - Description (optionnel)
   - Prix
   - Stock
4. **Ajouter une image**:
   - Option 1: Coller une URL externe
   - Option 2: Uploader un fichier local
5. **Cliquer sur "Ajouter"**

### 3. Mode offline
- Quand la connexion est perdue, l'interface affiche "Mode hors ligne"
- Les produits ajoutés restent dans IndexedDB
- Quand la connexion revient, sync automatique vers le serveur

---

## 📊 Architecture de la base de données

```
┌─────────────────────────────────────┐
│          USERS                      │
│  ├─ email (verified)                │
│  ├─ phone (verified)                │
│  ├─ passwordHash                    │
│  └─ role (client/admin)             │
└─────────────────────────────────────┘
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
 ADDRESSES ORDERS NOTIFICATIONS
    │      │      └─ type: promotion
    │      └─ status (pending/shipped)
    └─ default: true/false

┌─────────────────────────────────────┐
│      PRODUCTS                       │
│  ├─ name, slug                      │
│  ├─ categoryId (electronics/etc)    │
│  ├─ variants (prix, stock)          │
│  └─ images (multiple)               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   OFFLINE_SYNC_QUEUE                │
│  ├─ action (create/update/delete)   │
│  ├─ data (JSON)                     │
│  └─ status (pending/synced/failed)  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   ADMIN_NOTIFICATIONS               │
│  ├─ type (new_order/low_stock)      │
│  ├─ title, message                  │
│  └─ isRead                          │
└─────────────────────────────────────┘
```

---

## 🔗 Endpoints API principaux

### Auth
```http
POST /auth/register
POST /auth/login
POST /auth/verify-email
POST /auth/verify-phone
```

### Products
```http
GET    /products
GET    /products/:slug
GET    /products/category/:categoryId
POST   /products
PUT    /products/:id
DELETE /products/:id
POST   /products/image/upload
```

### Admin Notifications (SSE)
```http
GET    /admin/notifications/subscribe (Server-Sent Events)
GET    /admin/notifications
GET    /admin/notifications/unread
PUT    /admin/notifications/:id/read
```

---

## 🔒 Fonctionnalités de sécurité

- ✅ JWT tokens (24h expiration)
- ✅ Mot de passe hashé avec bcryptjs
- ✅ CORS configuré
- ✅ Validation des emails et téléphones
- ✅ Vérification en 2 étapes obligatoire
- ✅ Rate limiting sur les endpoints sensibles
- ✅ Variables sensibles en .env

---

## 🐛 Dépannage

### L'email n'est pas envoyé
→ Vérifier que Gmail a un **mot de passe d'app** (pas le mot de passe principal)
→ Vérifier que les credentials sont exacts dans `.env`

### Le SMS n'est pas reçu
→ Vérifier que le compte Twilio a du crédit
→ Vérifier le numéro Twilio dans `.env`

### Cloudinary - Images ne s'uploadent pas
→ Vérifier Cloud Name, API Key, API Secret
→ S'assurer que le dossier Cloudinary a les permissions

### IndexedDB ne fonctionne pas (offline)
→ Vérifier que IndexedDB est activé dans les paramètres du navigateur
→ Ouvrir DevTools → Application → IndexedDB

### Port déjà utilisé
→ Backend sur 3000: `npm run start:dev -- --port 3001`
→ Frontend sur 3001: `npm run dev -- -p 3000`

---

## 📚 Documentation complète

Voir [IMPLEMENTATION.md](./IMPLEMENTATION.md) pour:
- Architecture complète du projet
- Tous les endpoints API
- Configuration détaillée des services
- Modèles de données complets
- Conseils de déploiement

---

## 🚀 Prochaines étapes (optionnel)

1. **Intégration de paiement**:
   - Stripe, PayPal, ou Ixaris pour Afrique

2. **Dashboard client**:
   - Historique commandes
   - Wishlist
   - Reviews

3. **Analytics**:
   - Google Analytics
   - Tableau de bord des ventes

4. **Localisation**:
   - Multi-langues
   - Devise locale

5. **Mobile app**:
   - React Native
   - Flutter

---

## 💬 Support

- 📧 Email: support@debymarket.com
- 📱 WhatsApp: [Your number]
- 💻 GitHub Issues: [Your repo]

---

**Version**: 1.0.0  
**Date**: Mai 2026  
**Statut**: ✅ Prêt pour le déploiement
