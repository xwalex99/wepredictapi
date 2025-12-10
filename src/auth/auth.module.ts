import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtGuard } from './jwt.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 'secret-jwt-key';
        return {
          secret,
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
  ],
  providers: [JwtStrategy, JwtGuard],
  exports: [JwtModule, JwtGuard],
})
export class AuthModule {}
