import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect(); // Connecte NestJS à PostgreSQL au démarrage
    } catch (err: unknown) {
      // En environnement de dev/local, permettre au serveur de démarrer
      // même si la base de données n'est pas disponible. Log l'erreur.
      // Ne pas relancer l'erreur pour permettre les endpoints en mémoire.
      // IMPORTANT: en production, il est recommandé de laisser l'erreur remonter.

      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(
        'Prisma $connect failed — continuing without DB (dev mode).',
        errorMessage,
      );
    }
  }
}
