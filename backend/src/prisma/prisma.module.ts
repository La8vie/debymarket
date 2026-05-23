import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Rend Prisma disponible partout dans l'application
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
