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
    const raw = await this.commonDal.callProcedure('register_user', [dto.email, dto.username, hashedPassword]);
    // raw puede ser RowDataPacket[][] o RowDataPacket[]; normalizamos para obtener la primera fila
    let rows: any[] = Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw;
    const first = rows && rows[0] ? rows[0] : null;
    if (!first) return { success: false, message: 'Error registrando usuario' };
    return {
      success: !!first.success,
      message: first.message || '',
      user_id: first.user_id || first.id || undefined,
    };
  }

  /**
   * Valida credenciales del usuario
   * Llama al procedimiento login_user
   */
  async loginUser(dto: LoginDto, hashedPassword: string): Promise<LoginResponse> {
    const raw = await this.commonDal.callProcedure('login_user', [dto.email, hashedPassword]);
    let rows: any[] = Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw;
    const first = rows && rows[0] ? rows[0] : null;
    if (!first) return { success: false, message: 'Error en login' };
    return {
      success: !!first.success,
      message: first.message || '',
      user_id: first.user_id || first.id || undefined,
      username: first.username || undefined,
      email: first.email || undefined,
    };
  }

  /**
   * Obtiene datos del usuario por ID
   */
  async getUserById(userId: string) {
    const raw = await this.commonDal.callProcedure('get_user_by_id', [userId]);
    let rows: any[] = Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw;
    return rows && rows[0] ? rows[0] : null;
  }
}
