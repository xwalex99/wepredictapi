import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UserResponseDto {
  id: string; // UUID como string
  email: string;
  username: string;
  created_at?: Date;
}

export class AuthResponseDto {
  success: boolean;
  message: string;
  user?: UserResponseDto;
  token?: string;
}
