# DebyMarket

DebyMarket est une plateforme e-commerce fullstack avec un backend NestJS + Prisma et un frontend Next.js + Zustand.

## Structure du projet

- `backend/` : API NestJS, Prisma, authentication, upload d'images, notifications et paiements.
- `frontend/` : application Next.js, PWA, gestion de panier et interface admin.

## Démarrage rapide

### Backend
```bash
cd backend
npm install
cp .env.example .env
# modifier .env selon votre environnement
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# modifier .env.local si besoin
npm run dev -- -p 3001
```

## Bonnes pratiques

- Utiliser `backend/.env.example` et `frontend/.env.example` comme base.
- Vérifier que `DATABASE_URL` pointe vers votre instance PostgreSQL.
- Utiliser `NEXT_PUBLIC_API_URL` pour pointer vers le backend.

## Documentation

Le fichier `IMPLEMENTATION.md` contient la documentation de la solution, les endpoints et la configuration recommandée.
