import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ example: '12345678901234567890', description: 'ID de usuario de Google' })
  @IsString()
  @IsNotEmpty()
  google_sub: string;

  @ApiProperty({ example: 'user@gmail.com', description: 'Email de Google' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre completo (opcional)', required: false })
  @IsString()
  @IsOptional()
  full_name?: string;
}

