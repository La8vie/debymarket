This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Configuration

Copiez le modèle d'environnement :

```bash
cp .env.example .env.local
```

Modifier `NEXT_PUBLIC_API_URL` pour pointer vers votre backend.

### Tester depuis une autre ville

Si vous voulez partager le site avec des amis à distance, `localhost` ne suffit pas.

Option 1 : tunnel local avec ngrok

1. Lancez le frontend :

```bash
npm run dev -- -p 3001
```

2. Ouvrez un tunnel vers le port 3001 :

```bash
ngrok http 3001
```

3. Dans `.env.local`, mettez :

```env
NEXT_PUBLIC_API_URL=https://xxxxx.ngrok.io
```

Option 2 : déployer le frontend et le backend

- Frontend : Vercel, Netlify, Cloudflare Pages, etc.
- Backend : Railway, Render, Fly, Heroku, etc.

Ensuite, mettez `NEXT_PUBLIC_API_URL` sur l’URL publique du backend.

### Démarrage

```bash
npm run dev -- -p 3001
```

Ouvrez [http://localhost:3001](http://localhost:3001) avec votre navigateur.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
