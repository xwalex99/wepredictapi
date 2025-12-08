import { Injectable } from '@nestjs/common';
import { CommonDal } from '../commonservices/common.dal';
import { RegisterDto, LoginDto } from './user.dto';

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id?: string; // UUID como string
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user_id?: string; // UUID como string
  username?: string;
  email?: string;
}

@Injectable()
export class UserDal {
  constructor(private readonly commonDal: CommonDal) {}

  /**
   * Registra un nuevo usuario en la BD
   * Llama al procedimiento register_user
   */
  async registerUser(dto: RegisterDto, hashedPassword: string): Promise<RegisterResponse> {
    const result = await this.commonDal.callProcedureOne<RegisterResponse>(
      'register_user',
      [dto.email, dto.username, hashedPassword],
    );

    return result || { success: false, message: 'Error registrando usuario' };
  }

  /**
   * Valida credenciales del usuario
   * Llama al procedimiento login_user
   */
  async loginUser(dto: LoginDto, hashedPassword: string): Promise<LoginResponse> {
    const result = await this.commonDal.callProcedureOne<LoginResponse>(
      'login_user',
      [dto.email, hashedPassword],
    );

    return result || { success: false, message: 'Error en login' };
  }

  /**
   * Obtiene datos del usuario por ID
   */
  async getUserById(userId: string) {
    const result = await this.commonDal.callProcedureOne(
      'get_user_by_id',
      [userId],
    );

    return result;
  }
}
