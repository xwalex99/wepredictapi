import { Injectable } from '@nestjs/common';
import { CommonDal } from '../commonservices/common.dal';
import { RegisterDto, LoginDto } from './user.dto';

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id?: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user_id?: number;
  username?: string;
  email?: string;
}

@Injectable()
export class UserDal {
  constructor(private readonly commonDal: CommonDal) {}

  /**
   * Registra un nuevo usuario en la BD
   * Llama al procedimiento sp_register_user
   */
  async registerUser(dto: RegisterDto, hashedPassword: string): Promise<RegisterResponse> {
    const result = await this.commonDal.callProcedureOne<RegisterResponse>(
      'sp_register_user',
      [dto.email, dto.username, hashedPassword],
    );

    return result || { success: false, message: 'Error registrando usuario' };
  }

  /**
   * Valida credenciales del usuario
   * Llama al procedimiento sp_login_user
   */
  async loginUser(dto: LoginDto, hashedPassword: string): Promise<LoginResponse> {
    const result = await this.commonDal.callProcedureOne<LoginResponse>(
      'sp_login_user',
      [dto.email, hashedPassword],
    );

    return result || { success: false, message: 'Error en login' };
  }

  /**
   * Obtiene datos del usuario por ID
   */
  async getUserById(userId: number) {
    const result = await this.commonDal.callProcedureOne(
      'sp_get_user_by_id',
      [userId],
    );

    return result;
  }
}
