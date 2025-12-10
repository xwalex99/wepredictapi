import { Module } from '@nestjs/common';
import { ChatGptService } from './chatgpt.service';
import { ChatGptController } from './chatgpt.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ChatGptController],
  providers: [ChatGptService],
  exports: [ChatGptService],
})
export class ChatGptModule {}

