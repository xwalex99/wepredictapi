const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ValidationPipe } = require('@nestjs/common');

let cachedApp;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(AppModule, {
      logger: false, // Desactivar logs en producción
    });
    
    // Habilitar CORS para Vercel
    cachedApp.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    
    // Validación global
    cachedApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    await cachedApp.init();
  }
  
  return cachedApp;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};

