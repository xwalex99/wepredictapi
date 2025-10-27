const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');

let cachedApp;
let isInitializing = false;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  if (isInitializing) {
    // Esperar a que termine la inicialización
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cachedApp;
  }

  try {
    isInitializing = true;
    
    const { AppModule } = require('../dist/app.module');
    
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : false,
      bufferLogs: true,
    });
    
    // Habilitar CORS
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
    
    // Validación global
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    await app.init();
    
    cachedApp = app;
    isInitializing = false;
    
    return cachedApp;
  } catch (error) {
    isInitializing = false;
    console.error('Error initializing app:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    const app = await bootstrap();
    const instance = app.getHttpAdapter().getInstance();
    return instance(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
};
