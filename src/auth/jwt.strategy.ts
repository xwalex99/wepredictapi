import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Usar el mismo secret que JwtModule para firmar tokens
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret-jwt-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, username: payload.username };
  }
}
