import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UserDal, RegisterResponse, LoginResponse } from './user.dal';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './user.dto';

@Injectable()
export class UserBll {
  constructor(
    private readonly userDal: UserDal,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Hashea una contraseña usando SHA-256
   * En producción, usa bcrypt o argon2
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Registra un nuevo usuario
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Validaciones básicas
    if (!dto.email || !dto.username || !dto.password) {
      throw new BadRequestException('Faltan campos requeridos');
    }

    // Hashear la contraseña
    const hashedPassword = this.hashPassword(dto.password);

    // Llamar al DAL para registrar
    const result = await this.userDal.registerUser(dto, hashedPassword);

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    if (!result.user_id) {
      throw new BadRequestException('Error al obtener el ID del usuario registrado');
    }

    // Obtener datos del usuario registrado
    const user = await this.userDal.getUserById(result.user_id);

    if (!user) {
      throw new BadRequestException('No se pudo obtener los datos del usuario registrado');
    }

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
      },
    };
  }

  /**
   * Login de usuario
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Validaciones básicas
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email y contraseña son requeridos');
    }

    // Hashear la contraseña
    const hashedPassword = this.hashPassword(dto.password);

    // Llamar al DAL para validar credenciales
    const result = await this.userDal.loginUser(dto, hashedPassword);

    if (!result.success) {
      throw new UnauthorizedException(result.message);
    }

    if (!result.user_id || !result.email || !result.username) {
      throw new UnauthorizedException('Error al procesar credenciales');
    }

    // Generar JWT
    const payload = { sub: result.user_id, email: result.email, username: result.username };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login exitoso',
      user: {
        id: result.user_id,
        email: result.email,
        username: result.username,
      },
      token,
    };
  }

  /**
   * Obtiene información del usuario
   */
  async getUserInfo(userId: number): Promise<UserResponseDto> {
    const user = await this.userDal.getUserById(userId);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
    };
  }
}
