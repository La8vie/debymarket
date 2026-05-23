import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string; shortDesc?: string; description?: string }) {
    return this.prisma.product.create({ data });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true, category: true, brand: true }, // Inclut les variants du produit
    });
  }

  async findOne(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true, reviews: true },
    });
  }
}
