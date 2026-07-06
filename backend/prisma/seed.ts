import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer les catégories si elles n'existent pas
  const electronique = await prisma.category.upsert({
    where: { slug: 'electronique' },
    update: {},
    create: {
      name: 'Électronique',
      slug: 'electronique',
      imageUrl: 'https://placehold.co/400x300/1e3a8a/4ade80?text=Electronique',
      sortOrder: 1,
      isActive: true,
    },
  });

  const electromenager = await prisma.category.upsert({
    where: { slug: 'electromenager' },
    update: {},
    create: {
      name: 'Électroménager',
      slug: 'electromenager',
      imageUrl: 'https://placehold.co/400x300/f97316/ffedd5?text=Electromenager',
      sortOrder: 2,
      isActive: true,
    },
  });

  const mode = await prisma.category.upsert({
    where: { slug: 'mode' },
    update: {},
    create: {
      name: 'Mode',
      slug: 'mode',
      imageUrl: 'https://placehold.co/400x300/ec4899/fce7f3?text=Mode',
      sortOrder: 3,
      isActive: true,
    },
  });

  console.log('✅ Catégories créées');

  // Produits Électronique
  const electroniqueProducts = [
    {
      name: 'Power Bank 30000mAh Ultra',
      slug: 'power-bank-30000mah-ultra',
      description: 'Power bank haute capacité avec charge rapide USB-C et ports multiples. Compatible tous appareils.',
      shortDesc: 'Charge rapide 30W, 30000mAh',
      categoryId: electronique.id,
      price: 25000,
      stock: 50,
      images: ['https://placehold.co/400x300/1e3a8a/4ade80?text=PowerBank'],
    },
    {
      name: 'Écouteurs Bluetooth Pro',
      slug: 'ecouteurs-bluetooth-pro',
      description: 'Écouteurs sans fil avec réduction de bruit active et autonomie 40h.',
      shortDesc: 'ANC 40h autonomie',
      categoryId: electronique.id,
      price: 35000,
      stock: 30,
      images: ['https://placehold.co/400x300/1e3a8a/4ade80?text=Ecouteurs'],
    },
    {
      name: 'Câble USB-C Charge Rapide',
      slug: 'cable-usb-c-charge-rapide',
      description: 'Câble USB-C 3A pour charge rapide et transfert de données. Longueur 2m.',
      shortDesc: '3A 2m nylon tressé',
      categoryId: electronique.id,
      price: 5000,
      stock: 100,
      images: ['https://placehold.co/400x300/1e3a8a/4ade80?text=Cable'],
    },
    {
      name: 'Chargeur Voiture 2 Ports USB',
      slug: 'chargeur-voiture-2-ports-usb',
      description: 'Chargeur voiture double port avec détection automatique et LED.',
      shortDesc: '2 ports 2.4A LED',
      categoryId: electronique.id,
      price: 8000,
      stock: 75,
      images: ['https://placehold.co/400x300/1e3a8a/4ade80?text=Chargeur'],
    },
    {
      name: 'Support Téléphone Voiture',
      slug: 'support-telephone-voiture',
      description: 'Support magnétique rotatif 360° pour tous smartphones.',
      shortDesc: 'Magnétique 360°',
      categoryId: electronique.id,
      price: 6000,
      stock: 60,
      images: ['https://placehold.co/400x300/1e3a8a/4ade80?text=Support'],
    },
    {
      name: 'Lampe LED Rechargeable',
      slug: 'lampe-led-rechargeable',
      description: 'Lampe portable LED avec batterie 5000mAh et mode SOS.',
      shortDesc: '5000mAh mode SOS',
      categoryId: electronique.id,
      price: 12000,
      stock: 40,
      images: ['https://placehold.co/400x300/1e3a8a/4ade80?text=Lampe'],
    },
  ];

  // Produits Électroménager
  const electromenagerProducts = [
    {
      name: 'Mixeur Blender 2000W',
      slug: 'mixeur-blender-2000w',
      description: 'Mixeur puissant avec 6 lames et bol 1.5L inox.',
      shortDesc: '2000W 1.5L inox',
      categoryId: electromenager.id,
      price: 45000,
      stock: 25,
      images: ['https://placehold.co/400x300/f97316/ffedd5?text=Mixeur'],
    },
    {
      name: 'Fer à Repasser Vapeur',
      slug: 'fer-a-repasser-vapeur',
      description: 'Fer vapeur avec réservoir 300ml et anti-calcaire.',
      shortDesc: '300ml anti-calcaire',
      categoryId: electromenager.id,
      price: 18000,
      stock: 45,
      images: ['https://placehold.co/400x300/f97316/ffedd5?text=Fer'],
    },
    {
      name: 'Ventilateur Tour 40cm',
      slug: 'ventilateur-tour-40cm',
      description: 'Ventilateur silencieux avec 3 vitesses et télécommande.',
      shortDesc: '40cm 3 vitesses télécommande',
      categoryId: electromenager.id,
      price: 22000,
      stock: 35,
      images: ['https://placehold.co/400x300/f97316/ffedd5?text=Ventilateur'],
    },
    {
      name: 'Cafetière 12 Tasses',
      slug: 'cafetiere-12-tasses',
      description: 'Cafetière électrique avec filtre permanent et maintien au chaud.',
      shortDesc: '12 tasses maintien chaud',
      categoryId: electromenager.id,
      price: 28000,
      stock: 30,
      images: ['https://placehold.co/400x300/f97316/ffedd5?text=Cafetiere'],
    },
    {
      name: 'Grille-Pain 4 Tranches',
      slug: 'grille-pain-4-tranches',
      description: 'Grille-pain avec thermostat et arrêt automatique.',
      shortDesc: '4 tranches thermostat',
      categoryId: electromenager.id,
      price: 15000,
      stock: 50,
      images: ['https://placehold.co/400x300/f97316/ffedd5?text=GrillePain'],
    },
    {
      name: 'Aspirateur Balai 600W',
      slug: 'aspirateur-balai-600w',
      description: 'Aspirateur balai sans fil avec autonomie 30min.',
      shortDesc: '600W 30min sans fil',
      categoryId: electromenager.id,
      price: 55000,
      stock: 20,
      images: ['https://placehold.co/400x300/f97316/ffedd5?text=Aspirateur'],
    },
  ];

  // Produits Mode
  const modeProducts = [
    {
      name: 'Sac à Dos Urbain',
      slug: 'sac-a-dos-urbain',
      description: 'Sac à dos imperméable avec compartiment laptop 15.6".',
      shortDesc: 'Imperméable laptop 15.6"',
      categoryId: mode.id,
      price: 18000,
      stock: 40,
      images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Sac'],
    },
    {
      name: 'Montre Sport LED',
      slug: 'montre-sport-led',
      description: 'Montre digitale avec podomètre, cardio et étanche 50m.',
      shortDesc: 'Podomètre cardio étanche',
      categoryId: mode.id,
      price: 12000,
      stock: 60,
      images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Montre'],
    },
    {
      name: 'Lunettes de Soleil UV400',
      slug: 'lunettes-de-soleil-uv400',
      description: 'Lunettes polarisantes avec protection UV400.',
      shortDesc: 'Polarisées UV400',
      categoryId: mode.id,
      price: 8000,
      stock: 80,
      images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Lunettes'],
    },
    {
      name: 'Casquette Baseball',
      slug: 'casquette-baseball',
      description: 'Casquette coton ajustable avec logo brodé.',
      shortDesc: 'Coton ajustable brodé',
      categoryId: mode.id,
      price: 5000,
      stock: 100,
      images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Casquette'],
    },
    {
      name: 'Ceinture Cuir Genuine',
      slug: 'ceinture-cuir-genuine',
      description: 'Ceinture en cuir véritable avec boucle métallique.',
      shortDesc: 'Cuir véritable boucle métal',
      categoryId: mode.id,
      price: 10000,
      stock: 50,
      images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Ceinture'],
    },
    {
      name: 'Portefeuille RFID',
      slug: 'portefeuille-rfid',
      description: 'Portefeuille avec protection RFID et 8 emplacements cartes.',
      shortDesc: 'Protection RFID 8 cartes',
      categoryId: mode.id,
      price: 7000,
      stock: 70,
      images: ['https://placehold.co/400x300/ec4899/fce7f3?text=Portefeuille'],
    },
  ];

  // Insérer les produits
  for (const product of [...electroniqueProducts, ...electromenagerProducts, ...modeProducts]) {
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDesc: product.shortDesc,
          categoryId: product.categoryId,
          isActive: true,
          variants: {
            create: {
              sku: product.slug.toUpperCase(),
              price: product.price,
              stock: product.stock,
              isActive: true,
            },
          },
          images: {
            create: {
              url: product.images[0],
              altText: product.name,
              sortOrder: 0,
              isMain: true,
            },
          },
        },
      });
      console.log(`✅ Produit créé: ${product.name}`);
    } else {
      console.log(`⏭️  Produit existe déjà: ${product.name}`);
    }
  }

  console.log('🎉 Seeding terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
