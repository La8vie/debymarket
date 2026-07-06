import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateProductDto,
  UpdateProductDto,
  AddProductImageDto,
} from './dto/product.dto';
import { slugify } from './utils/slugify';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureDefaultCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        "Impossible d'initialiser les catégories par défaut:",
        message,
      );
    }
  }

  private async ensureDefaultCategories() {
    const defaultCategories = [
      {
        name: 'Électronique',
        slug: 'electronique',
        imageUrl: '',
        sortOrder: 1,
      },
      {
        name: 'Électroménager',
        slug: 'electromenager',
        imageUrl: '',
        sortOrder: 2,
      },
      { name: 'Mode', slug: 'mode', imageUrl: '', sortOrder: 3 },
    ];

    for (const category of defaultCategories) {
      await this.prisma.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          imageUrl: category.imageUrl,
          sortOrder: category.sortOrder,
          isActive: true,
        },
        create: category,
      });
    }
  }

  private async resolveCategoryId(categoryIdentifier?: string) {
    if (!categoryIdentifier) {
      return null;
    }

    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: categoryIdentifier }, { slug: categoryIdentifier }],
      },
    });

    return category?.id ?? null;
  }

  /**
   * Créer un nouveau produit avec images
   */
  async create(dto: CreateProductDto) {
    // Créer le slug
    const slug = slugify(dto.name);
    const categoryId = await this.resolveCategoryId(dto.categoryId);

    if (!categoryId) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    // Créer le produit
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: slug,
        description: dto.description,
        shortDesc: dto.shortDesc,
        categoryId,
        brandId: dto.brandId,
      },
    });

    // Créer la variante de prix
    const sku = `SKU-${slug.toUpperCase()}-${Date.now()}`;
    await this.prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: sku,
        price: dto.price || 0,
        comparePrice: dto.comparePrice,
        stock: dto.stock || 10,
      },
    });

    // Ajouter les images
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      for (let i = 0; i < dto.imageUrls.length; i++) {
        await this.prisma.productImage.create({
          data: {
            productId: product.id,
            url: dto.imageUrls[i],
            isMain: i === 0,
            sortOrder: i,
          },
        });
      }
    }

    return this.findOne(slug);
  }

  /**
   * Trouver tous les produits
   */
  async findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: true,
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  /**
   * Trouver un produit par slug
   */
  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        reviews: true,
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        brand: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Produit ${slug} non trouvé`);
    }

    return product;
  }

  /**
   * Trouver les produits par catégorie
   */
  async findByCategory(categoryId: string) {
    const resolvedCategoryId = await this.resolveCategoryId(categoryId);

    return this.prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: resolvedCategoryId ?? categoryId,
      },
      include: {
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
      },
    });
  }

  async findCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Mettre à jour un produit
   */
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name || product.name,
        description: dto.description,
      },
    });

    // Mettre à jour les variantes si le prix ou stock a changé
    if (dto.price !== undefined || dto.stock !== undefined) {
      await this.prisma.productVariant.updateMany({
        where: { productId: id },
        data: {
          price: dto.price || undefined,
          stock: dto.stock || undefined,
        },
      });
    }

    // Ajouter les nouvelles images
    if (dto.imageUrls && dto.imageUrls.length > 0) {
      for (let i = 0; i < dto.imageUrls.length; i++) {
        await this.prisma.productImage.create({
          data: {
            productId: id,
            url: dto.imageUrls[i],
            isMain: false,
            sortOrder: i + 100,
          },
        });
      }
    }

    return this.findOne(product.slug);
  }

  /**
   * Ajouter une image à un produit
   */
  async addImage(dto: AddProductImageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    const image = await this.prisma.productImage.create({
      data: {
        productId: dto.productId,
        url: dto.imageUrl,
        altText: dto.altText,
        sortOrder: product.images.length,
      },
    });

    return image;
  }

  /**
   * Supprimer une image
   */
  async removeImage(imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image non trouvée');
    }

    // Supprimer de Cloudinary si nécessaire
    if (image.url.includes('cloudinary')) {
      try {
        await this.storageService.deleteImage(image.url);
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de l'image Cloudinary:",
          error,
        );
      }
    }

    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  /**
   * Supprimer un produit
   */
  async remove(id: string) {
    // Supprimer les images
    const images = await this.prisma.productImage.findMany({
      where: { productId: id },
    });

    for (const image of images) {
      if (image.url.includes('cloudinary')) {
        try {
          await this.storageService.deleteImage(image.url);
        } catch (error) {
          console.error("Erreur lors de la suppression de l'image:", error);
        }
      }
    }

    // Supprimer les images de la BDD
    await this.prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // Supprimer les variantes
    await this.prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    // Supprimer les avis
    await this.prisma.review.deleteMany({
      where: { productId: id },
    });

    // Supprimer le produit
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
