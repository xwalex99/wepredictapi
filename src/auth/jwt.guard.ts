import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Siempre requiere token - el guard padre valida el JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Si hay error o no hay usuario, rechazar la petición
    if (err || !user) {
      // Si hay un error específico de Passport, usarlo
      if (err) {
        throw err;
      }
      // Si info tiene detalles del error (ej: token expirado, secret incorrecto)
      if (info) {
        const message = info.message || 'Token JWT inválido';
        throw new UnauthorizedException(message);
      }
      throw new UnauthorizedException('Token JWT requerido o inválido');
    }
    return user;
  }
}
