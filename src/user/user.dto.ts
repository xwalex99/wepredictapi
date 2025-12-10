import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'prueba1@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'prueba1' })
  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  username: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'prueba1@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'prueba1' })
  @IsString()
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'a3f2e8b4-1d44-4cbe-a6a1-123456789abc' })
  id: string; // UUID como string

  @ApiProperty({ example: 'prueba1@gmail.com' })
  email: string;

  @ApiProperty({ example: 'prueba1' })
  username: string;

  @ApiProperty({ example: '2025-01-01T12:00:00.000Z', required: false })
  created_at?: Date;
}

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Usuario registrado con éxito' })
  message: string;

  @ApiProperty({ type: UserResponseDto, required: false })
  user?: UserResponseDto;

  @ApiProperty({ example: 'jwt-token', required: false })
  token?: string;
}
