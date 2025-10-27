import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

export async function getApp(): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Habilitar CORS
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Habilitar validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('WePredict API')
      .setDescription('API para gestión de predicciones con autenticación local y Google OAuth')
      .setVersion('1.0')
      .addTag('auth', 'Endpoints de autenticación')
      .addTag('app', 'Endpoints generales')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // ⚠️ IMPORTANTE: NO usar app.listen() en serverless
    await app.init();
    
    cachedApp = app;
  }
  return cachedApp;
}

