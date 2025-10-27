const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const path = require('path');

let cachedApp;
let isInitializing = false;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cachedApp;
  }

  try {
    isInitializing = true;
    
    // Debug: log directories
    console.log('__dirname:', __dirname);
    console.log('process.cwd():', process.cwd());
    
    // Resolve the app.module from the built dist folder
    const appModulePath = path.resolve(__dirname, '..', 'dist', 'app.module');
    console.log('Trying to load:', appModulePath);
    
    // Check if the path exists
    try {
      const fs = require('fs');
      const files = fs.readdirSync(path.resolve(__dirname, '..', 'dist'));
      console.log('Files in dist:', files);
    } catch (e) {
      console.log('Could not read dist folder:', e.message);
    }
    
    const { AppModule } = require(appModulePath);
    
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : false,
      bufferLogs: true,
    });
    
    app.enableCors({ 
      origin: true, 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', 
      credentials: true 
    });
    
    app.useGlobalPipes(
      new ValidationPipe({ 
        whitelist: true, 
        forbidNonWhitelisted: true, 
        transform: true 
      })
    );
    
    const config = new DocumentBuilder()
      .setTitle('WePredict API')
      .setDescription('API para predicciones')
      .setVersion('1.0')
      .addTag('auth', 'Auth')
      .addTag('app', 'App')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    
    await app.init();
    cachedApp = app;
    isInitializing = false;
    return cachedApp;
  } catch (error) {
    isInitializing = false;
    console.error('Error initializing app:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

module.exports = async (req, res) => {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

