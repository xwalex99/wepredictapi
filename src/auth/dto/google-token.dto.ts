import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...', 
    description: 'ID Token de Google OAuth' 
  })
  @IsString()
  @IsNotEmpty()
  id_token: string;
}

