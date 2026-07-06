# 📱 DebyMarket - Plateforme E-Commerce Flexible

## 🎯 Vue d'ensemble

DebyMarket est une plateforme e-commerce moderne conçue pour les admin sans connaissances techniques. Elle offre:

✅ **Dashboard admin intuitif** - Ajouter des produits sans code  
✅ **3 catégories principales** - Électronique, Électroménager, Mode  
✅ **Synchronisation offline** - Fonctionnalité PWA complète  
✅ **Double vérification** - Email + SMS obligatoire à l'inscription  
✅ **Upload d'images flexible** - URL ou fichier local  
✅ **Notifications intelligentes** - Pas de spam, contrôlables par l'utilisateur  
✅ **Notifications admin** - Alertes pour chaque commande  

---

## 🛠️ Architecture

### Backend (NestJS + Prisma)
```
backend/
├── src/
│   ├── auth/              → Authentification & vérification
│   ├── products/          → Gestion des produits
│   ├── notification/      → Email & SMS
│   ├── storage/           → Upload d'images (Cloudinary)
│   ├── prisma/            → ORM
│   └── payments/          → Gestion des paiements
```

### Frontend (Next.js + Zustand)
```
frontend/
├── app/
│   ├── register/          → Page d'inscription (double vérification)
│   ├── admin/
│   │   └── dashboard/     → Dashboard admin
│   ├── stores/            → Store offline (Zustand + IndexedDB)
│   └── components/        → Composants réutilisables
```

---

## 📋 Configuration

### 1. Variables d'environnement

**Backend** - Copier le modèle et créer `.env`:
```bash
cp backend/.env.example backend/.env
```

Exemple de variables :
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/debymarket"
JWT_SECRET="your-secret-key"
MAIL_SERVICE="gmail"
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-app-password"
TWILIO_ACCOUNT_SID="your-twilio-id"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"
CLOUDINARY_CLOUD_NAME="your-name"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
PORT=3000
```

**Frontend** - Copier le modèle et créer `.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```

Exemple de variable :
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 2. Services externes requis

#### Email (Nodemailer)
- Gmail: [Générer un mot de passe d'app](https://myaccount.google.com/apppasswords)
- Ou utiliser SendGrid, Mailgun, etc.

#### SMS (Twilio)
- [Créer un compte Twilio](https://www.twilio.com/console)
- Obtenir Account SID, Auth Token, et un numéro de téléphone

#### Upload d'images (Cloudinary)
- [S'inscrire sur Cloudinary](https://cloudinary.com)
- Obtenir Cloud Name, API Key, et API Secret

---

## 🚀 Installation & Démarrage

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- -p 3001
```

Le site sera accessible à `http://localhost:3001`.

> Si tu préfères, tu peux aussi lancer le frontend sur un autre port avec `PORT=3001` ou en modifiant la commande de démarrage.

---

## 📱 Fonctionnalités principales

### 1️⃣ Page d'inscription (`/register`)

**Processus en 3 étapes**:
1. Remplir les informations (prénom, nom, email, téléphone)
2. Vérifier l'email (code reçu par mail)
3. Vérifier le téléphone (code reçu par SMS)

**API Endpoints**:
```http
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+22690000000",
  "password": "SecurePass123"
}

POST /auth/verify-email
{ "token": "email-verification-token" }

POST /auth/verify-phone
{ "token": "sms-verification-token" }
```

### 2️⃣ Dashboard Admin (`/admin/dashboard`)

**Fonctionnalités**:
- ✅ Sélectionner une catégorie (Électronique, Électroménager, Mode)
- ✅ Ajouter un produit avec nom, description, prix, stock
- ✅ Upload image via URL ou fichier local
- ✅ Éditer/Supprimer les produits
- ✅ Synchronisation offline automatique

**API Endpoints**:
```http
POST /products
{ "name", "description", "categoryId", "price", "stock", "imageUrls" }

POST /products/image/upload
(multipart/form-data avec le fichier)

PUT /products/:id
(Mettre à jour les informations)

DELETE /products/:id
(Supprimer le produit)

GET /products/category/:categoryId
(Récupérer les produits d'une catégorie)
```

### 3️⃣ Synchronisation Offline

La PWA utilise **IndexedDB** pour stocker les données localement:

```javascript
// Initialiser
await productStore.initDB();

// Ajouter un produit (offline ou online)
await productStore.addProduct(product);

// Synchroniser quand la connexion revient
window.addEventListener('online', () => {
  productStore.syncWithServer(apiUrl);
});
```

**Fonctionnement**:
- ✅ Les produits ajoutés offline sont stockés dans IndexedDB
- ✅ Quand la connexion revient, sync automatique
- ✅ Interface fluide même sans internet

### 4️⃣ Notifications

#### Pour les clients
- **Email**: Newsletters promotions (contrôlable par utilisateur)
- **SMS**: Mises à jour de commandes (contrôlable)
- **Modèle**: Fréquence configurable (daily, weekly, monthly)

#### Pour l'admin
- **Notification admin**: Pour chaque nouvelle commande
- **Stock faible**: Alertes automatiques
- **Nouvelles inscriptions**: Suivi des utilisateurs

---

## 🗄️ Modèles de données

### User
```prisma
model User {
  id                 String                   @id @default(cuid())
  email              String                   @unique
  phone              String                   @unique
  isEmailVerified    Boolean                  @default(false)
  isPhoneVerified    Boolean                  @default(false)
  passwordHash       String
  role               String
  notificationPrefs  NotificationPreference?
  verificationTokens VerificationToken[]
  orders             Order[]
  createdAt          DateTime                 @default(now())
  updatedAt          DateTime                 @updatedAt
}
```

### Product
```prisma
model Product {
  id          String            @id @default(cuid())
  name        String
  slug        String            @unique
  description String?
  categoryId  String
  images      ProductImage[]
  variants    ProductVariant[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  url       String
  altText   String?
  isMain    Boolean  @default(false)
  sortOrder Int      @default(0)
}
```

### OfflineSyncQueue
```prisma
model OfflineSyncQueue {
  id        String   @id @default(cuid())
  userId    String
  action    String
  data      Json
  status    String
  createdAt DateTime @default(now())
  syncedAt  DateTime?
}
```

---

## 🔐 Sécurité

- ✅ JWT pour l'authentification
- ✅ Mot de passe hashé (bcryptjs)
- ✅ Vérification email + SMS obligatoire
- ✅ Rate limiting sur les endpoints
- ✅ Helmet pour sécuriser les en-têtes HTTP
- ✅ CORS configuré
- ✅ Routes admin protégées par JWT + rôle
- ✅ Variables d'env sécurisées

---

## 🎨 UX/UI

### Design Principles
- **Mobile-first**: Responsive sur tous les appareils
- **Dark mode**: Interface moderne avec Tailwind CSS
- **Intuitive**: Aucune connaissance technique requise
- **Fast**: Optimisé pour les connexions lentes
- **Accessible**: Supports clavier, screen readers

### Catégories avec icônes
- ⚡ **Électronique**: Téléphones, ordinateurs, accessoires
- 🍳 **Électroménager**: Cuisines, réfrigérateurs, etc.
- 👕 **Mode**: Vêtements, chaussures, accessoires

---

## 📊 Base de données

### Schéma complet
```
users
├── id, email, phone, passwordHash
├── isEmailVerified, isPhoneVerified
├── firstName, lastName, role
└── createdAt, updatedAt

products
├── id, name, slug, description
├── categoryId, brandId
├── isActive, createdAt
└── images[], variants[]

product_images
├── id, productId, url
├── altText, isMain, sortOrder
└── createdAt

product_variants
├── id, productId, sku
├── price, comparePrice, costPrice
├── stock, lowStockAlert
└── attributes (Json)

verification_tokens
├── id, userId, type (email|phone)
├── token, expiresAt
└── createdAt

notification_preferences
├── id, userId
├── emailPromotions, emailOrderUpdates
├── smsPromotions, smsOrderUpdates
├── notificationFrequency
└── createdAt, updatedAt

offline_sync_queue
├── id, userId, action, data
├── status (pending|synced|failed)
└── createdAt, syncedAt

admin_notifications
├── id, type (new_order|low_stock)
├── title, message, orderId
├── isRead, createdAt
```

---

## 🧪 Testing

```bash
# Backend
npm run test
npm run test:e2e

# Frontend
npm run test
npm run build
```

---

## 📚 Endpoints API complète

### Auth
- `POST /auth/register` - S'inscrire
- `POST /auth/login` - Se connecter
- `POST /auth/verify-email` - Vérifier email
- `POST /auth/verify-phone` - Vérifier phone

### Products
- `GET /products` - Tous les produits
- `GET /products/:slug` - Un produit
- `GET /products/category/:id` - Par catégorie
- `POST /products` - Créer
- `PUT /products/:id` - Mettre à jour
- `DELETE /products/:id` - Supprimer
- `POST /products/image/upload` - Uploader image
- `POST /products/image/add` - Ajouter image
- `DELETE /products/image/:id` - Supprimer image

### Orders
- `GET /orders` - Mes commandes
- `POST /orders` - Créer commande
- `GET /orders/:id` - Détails commande

### Notifications
- `GET /notifications` - Mes notifications
- `PUT /notifications/:id/read` - Marquer comme lu
- `GET /admin/notifications` - Notifications admin

---

## 🐛 Dépannage

### L'email n'est pas envoyé
- Vérifier `MAIL_USER` et `MAIL_PASSWORD`
- Pour Gmail: Utiliser un mot de passe d'app (pas le mot de passe principal)

### Le SMS n'est pas reçu
- Vérifier le numéro Twilio (`TWILIO_PHONE_NUMBER`)
- S'assurer que le compte Twilio a du crédit

### Les images ne s'uploadent pas
- Vérifier les credentials Cloudinary
- S'assurer que le bucket a les permissions correctes

### Offline ne fonctionne pas
- Vérifier que IndexedDB est activé dans le navigateur
- Vérifier la console pour les erreurs

---

## 🚀 Déploiement

### Vercel (Frontend)
```bash
cd frontend
vercel deploy
```

### Railway/Heroku (Backend)
```bash
cd backend
# Configurer les variables d'env
# git push
```

---

## 📞 Support

Pour toute question ou problème:
- 📧 Email: support@debymarket.com
- 💬 Chat: [Your chat link]
- 📱 WhatsApp: [Your number]

---

## 📄 Licence
 
MIT - Voir LICENSE.md

---

**Version**: 1.0.0  
**Dernière mise à jour**: Mai 2026
