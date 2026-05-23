import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string; shortDesc?: string; description?: string; price?: number; stock?: number }) {
    const { price, stock, ...productData } = data;
    
    // 1. Créer le produit
    const product = await this.prisma.product.create({
      data: productData
    });

    // 2. Créer une variante par défaut pour y stocker le prix et le stock
    const variantPrice = price !== undefined ? price : 0;
    const variantStock = stock !== undefined ? stock : 10; // Stock par défaut de 10
    const sku = `SKU-${product.slug.toUpperCase()}-${Date.now()}`;

    await this.prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: sku,
        price: variantPrice,
        stock: variantStock,
      }
    });

    // Retourner le produit avec ses variantes pour correspondre au mapping du frontend
    return this.prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true }
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true, category: true, brand: true },
    });
  }

  async findOne(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true, reviews: true },
    });
  }

  async remove(id: string) {
    // 1. Supprimer les variantes associées pour éviter les violations de clés étrangères
    await this.prisma.productVariant.deleteMany({
      where: { productId: id }
    });

    // 2. Supprimer les avis (reviews)
    await this.prisma.review.deleteMany({
      where: { productId: id }
    });

    // 3. Supprimer le produit
    return this.prisma.product.delete({
      where: { id }
    });
  }
}
