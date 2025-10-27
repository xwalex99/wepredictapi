import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthDal {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Llama a la función register_user de PostgreSQL
   */
  async registerUser(email: string, fullName: string, password: string): Promise<User> {
    return this.databaseService.callFunction<User>('register_user', [
      email,
      fullName,
      password,
    ]);
  }

  /**
   * Llama a la función verify_user de PostgreSQL
   */
  async verifyUser(email: string, password: string): Promise<User> {
    return this.databaseService.callFunction<User>('verify_user', [
      email,
      password,
    ]);
  }

  /**
   * Llama a la función register_user_google de PostgreSQL
   */
  async registerUserGoogle(
    googleSub: string,
    email: string,
    fullName?: string,
  ): Promise<User> {
    return this.databaseService.callFunction<User>('register_user_google', [
      googleSub,
      email,
      fullName || null,
    ]);
  }

  /**
   * Llama a la función login_google de PostgreSQL
   */
  async loginGoogle(
    googleSub: string,
    email: string,
    fullName?: string,
  ): Promise<User> {
    return this.databaseService.callFunction<User>('login_google', [
      googleSub,
      email,
      fullName || null,
    ]);
  }
}

