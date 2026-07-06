import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDesc?: string;

  @IsString()
  categoryId: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  comparePrice?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsArray()
  @IsOptional()
  imageUrls?: string[]; // URLs des images (depuis Cloudinary ou URL externe)
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsArray()
  @IsOptional()
  imageUrls?: string[];
}

export class AddProductImageDto {
  @IsString()
  productId: string;

  @IsUrl()
  imageUrl: string;

  @IsString()
  @IsOptional()
  altText?: string;
}
