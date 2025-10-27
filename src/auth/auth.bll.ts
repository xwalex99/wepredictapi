import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthDal } from './auth.dal';
import { GoogleOAuthService } from './google-oauth.service';
import { User } from './interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleTokenDto } from './dto/google-token.dto';

@Injectable()
export class AuthBll {
  constructor(
    private readonly authDal: AuthDal,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  /**
   * Registra un nuevo usuario con email y password local
   */
  async register(registerDto: RegisterDto): Promise<User> {
    try {
      const user = await this.authDal.registerUser(
        registerDto.email,
        registerDto.full_name,
        registerDto.password,
      );
      return user;
    } catch (error) {
      if (error.code === 'unique_violation' || error.message?.includes('ya está registrado')) {
        throw new BadRequestException('El email ya está registrado');
      }
      throw new BadRequestException('Error al registrar usuario: ' + error.message);
    }
  }

  /**
   * Autentica un usuario con email y password local
   */
  async login(loginDto: LoginDto): Promise<User> {
    try {
      const user = await this.authDal.verifyUser(loginDto.email, loginDto.password);
      return user;
    } catch (error) {
      if (error.message?.includes('Credenciales inválidas')) {
        throw new UnauthorizedException('Email o contraseña incorrectos');
      }
      if (error.message?.includes('no tiene contraseña local')) {
        throw new UnauthorizedException('Esta cuenta no tiene contraseña local. Usa Google para iniciar sesión.');
      }
      throw new UnauthorizedException('Error al iniciar sesión: ' + error.message);
    }
  }

  /**
   * Registra un usuario nuevo con Google
   */
  async registerGoogle(googleAuthDto: GoogleAuthDto): Promise<User> {
    try {
      const user = await this.authDal.registerUserGoogle(
        googleAuthDto.google_sub,
        googleAuthDto.email,
        googleAuthDto.full_name,
      );
      return user;
    } catch (error) {
      throw new BadRequestException('Error al registrar usuario con Google: ' + error.message);
    }
  }

  /**
   * Autentica un usuario existente con Google (login)
   */
  async loginGoogle(googleAuthDto: GoogleAuthDto): Promise<User> {
    try {
      const user = await this.authDal.loginGoogle(
        googleAuthDto.google_sub,
        googleAuthDto.email,
        googleAuthDto.full_name,
      );
      return user;
    } catch (error) {
      throw new UnauthorizedException('Error al iniciar sesión con Google: ' + error.message);
    }
  }

  /**
   * Autentica o registra un usuario con Google usando ID token
   */
  async loginOrRegisterWithGoogle(googleTokenDto: GoogleTokenDto): Promise<User> {
    try {
      // Verificar el token de Google
      const googleData = await this.googleOAuthService.verifyIdToken(googleTokenDto.id_token);

      // Intentar login (o crear si no existe)
      const user = await this.authDal.loginGoogle(
        googleData.google_sub,
        googleData.email,
        googleData.full_name,
      );

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error al autenticar con Google: ' + error.message);
    }
  }

  /**
   * Helper: Elimina datos sensibles del usuario antes de enviar la respuesta
   */
  sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

