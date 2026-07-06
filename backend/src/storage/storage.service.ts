import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload une image vers Cloudinary
   * Utilisez soit un Buffer, soit une URL
   */
  async uploadImage(
    file: Buffer | string,
    folder: string = 'debymarket/products',
  ): Promise<string> {
    if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, { folder });
      if (!result?.secure_url) {
        throw new Error('Upload failed.');
      }
      return result.secure_url;
    }

    return new Promise<string>(
      (resolve, reject: (reason?: unknown) => void) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder },
          (error: Error | undefined, result: unknown) => {
            if (error) {
              reject(error);
            } else if (
              !result ||
              typeof result !== 'object' ||
              !('secure_url' in result)
            ) {
              reject(new Error('Upload failed.'));
            } else {
              const response = result as { secure_url?: string };
              if (!response.secure_url) {
                reject(new Error('Upload failed.'));
              } else {
                resolve(response.secure_url);
              }
            }
          },
        );

        uploadStream.end(file);
      },
    );
  }

  /**
   * Supprimer une image de Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraire le public_id de l'URL
      const matches = imageUrl.match(/\/([^/]+)\/([^/]+)\.[a-z]+$/);
      if (matches && matches[1] && matches[2]) {
        const publicId = `${matches[1]}/${matches[2]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la suppression de l'image:", error);
    }
  }

  /**
   * Optimiser une image (redimensionner, compresser)
   */
  optimizeImage(imageUrl: string): string {
    return cloudinary.url(imageUrl, {
      width: 800,
      height: 800,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  /**
   * Générer une URL d'image avec des transformations
   */
  generateImageUrl(publicId: string, width?: number, height?: number): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
    });
  }
}
