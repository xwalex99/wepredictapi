import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatGptService } from './chatgpt.service';
import { ChatGptRequestDto, ChatGptResponseDto } from './chatgpt.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('chatgpt')
@ApiTags('chatgpt')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Post('chat')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Enviar mensaje a ChatGPT',
    description: 'Envía un mensaje a ChatGPT y recibe una respuesta. Requiere autenticación JWT.',
  })
  @ApiBody({ type: ChatGptRequestDto })
  @ApiResponse({
    status: 200,
    type: ChatGptResponseDto,
    description: 'Respuesta exitosa de ChatGPT',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la petición o respuesta de ChatGPT',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT requerido o inválido',
  })
  async chat(@Body() dto: ChatGptRequestDto): Promise<ChatGptResponseDto> {
    return this.chatGptService.chat(dto);
  }
}

