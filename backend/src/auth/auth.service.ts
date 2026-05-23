import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: { email: string; password: string; firstName?: string; lastName?: string }) {
    try {
      console.log('Tentative dinscription avec:', dto.email); // Ligne de debug

      const hash = await bcrypt.hash(dto.password, 12);
      
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const token = this.jwtService.sign({ sub: user.id, role: user.role });
      return { access_token: token, user: { id: user.id, email: user.email, role: user.role } };
    } catch (error) {
      console.error('ERREUR LORS DE L\'INSCRIPTION:', error); // Affiche l'erreur vraie
      throw new BadRequestException('Impossible de créer l\'utilisateur : ' + error.message);
    }
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('Identifiants invalides');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new BadRequestException('Identifiants invalides');

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { access_token: token };
  }
}
