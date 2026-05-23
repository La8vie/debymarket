import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Prend le token dans "Authorization: Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret_key_by_default_for_dev',
    });
  }

  // Ce qui est retourné ici se retrouve dans req.user
  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
