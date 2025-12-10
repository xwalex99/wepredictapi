import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ChatGptRequestDto {
  @ApiProperty({
    description: 'Mensaje o prompt para enviar a ChatGPT',
    example: '¿Qué es el machine learning?',
  })
  @IsString()
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  message: string;

  @ApiProperty({
    description: 'Modelo de OpenAI a usar (por defecto: gpt-3.5-turbo)',
    example: 'gpt-3.5-turbo',
    required: false,
    default: 'gpt-3.5-turbo',
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({
    description: 'Temperatura para la generación (0-2). Valores más altos = más creativo',
    example: 0.7,
    required: false,
    default: 0.7,
    minimum: 0,
    maximum: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiProperty({
    description: 'Número máximo de tokens en la respuesta',
    example: 500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxTokens?: number;
}

export class ChatGptResponseDto {
  @ApiProperty({
    description: 'Respuesta generada por ChatGPT',
    example: 'El machine learning es...',
  })
  response: string;

  @ApiProperty({
    description: 'Modelo usado para generar la respuesta',
    example: 'gpt-3.5-turbo',
  })
  model: string;

  @ApiProperty({
    description: 'Número de tokens usados',
    example: 150,
  })
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

