import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatGptRequestDto, ChatGptResponseDto } from './chatgpt.dto';

@Injectable()
export class ChatGptService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('API_GPT');
    
    if (!apiKey) {
      throw new Error('API_GPT no está configurada en las variables de entorno');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async chat(request: ChatGptRequestDto): Promise<ChatGptResponseDto> {
    try {
      const {
        message,
        model = 'gpt-3.5-turbo',
        temperature = 0.7,
        maxTokens,
      } = request;

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        temperature,
        ...(maxTokens && { max_tokens: maxTokens }),
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new BadRequestException('No se recibió respuesta de ChatGPT');
      }

      return {
        response,
        model: completion.model,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(
          `Error de OpenAI API: ${error.message}`,
        );
      }
      throw new BadRequestException(
        `Error al comunicarse con ChatGPT: ${error.message}`,
      );
    }
  }
}

