import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { StorageService } from '../storage/storage.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RateLimits } from '../common/decorators/rate-limit.decorator';
import {
  CreateProductDto,
  UpdateProductDto,
  AddProductImageDto,
} from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Créer un nouveau produit
   */
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @RateLimits.admin()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /**
   * Récupérer tous les produits
   */
  @Get()
  @RateLimits.public()
  findAll() {
    return this.productsService.findAll();
  }

  /**
   * Récupérer les catégories actives
   */
  @Get('categories')
  @RateLimits.public()
  findCategories() {
    return this.productsService.findCategories();
  }

  /**
   * Récupérer les produits par catégorie
   */
  @Get('category/:categoryId')
  @RateLimits.public()
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(categoryId);
  }

  /**
   * Récupérer un produit par slug
   */
  @Get(':slug')
  @RateLimits.public()
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  /**
   * Mettre à jour un produit
   */
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @RateLimits.admin()
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /**
   * Ajouter une image à un produit
   */
  @Post('image/add')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @RateLimits.admin()
  addImage(@Body() dto: AddProductImageDto) {
    return this.productsService.addImage(dto);
  }

  /**
   * Uploader une image
   */
  @Post('image/upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @RateLimits.admin()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      const imageUrl = await this.storageService.uploadImage(file.buffer);
      return { url: imageUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Erreur lors de l'upload: ${message}`);
    }
  }

  /**
   * Supprimer une image
   */
  @Delete('image/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @RateLimits.admin()
  removeImage(@Param('id') id: string) {
    return this.productsService.removeImage(id);
  }

  /**
   * Supprimer un produit
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  @RateLimits.admin()
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
