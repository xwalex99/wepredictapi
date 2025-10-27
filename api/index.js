const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');

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
    const path = require('path');
    const fs = require('fs');
    
    // Log for debugging
    console.log('Current working directory:', process.cwd());
    console.log('__dirname:', __dirname);
    
    // Check what files are available
    try {
      const files = fs.readdirSync(path.join(__dirname, '..'));
      console.log('Files in parent directory:', files);
    } catch (e) {
      console.log('Could not read parent directory');
    }
    
    // Try different possible paths
    let AppModule;
    const possiblePaths = [
      path.join(__dirname, '..', 'dist', 'app.module'),
      path.join(__dirname, '..', 'app.module'),
      path.join(process.cwd(), 'dist', 'app.module'),
      path.join(process.cwd(), 'app.module'),
    ];
    
    for (const modulePath of possiblePaths) {
      try {
        console.log('Trying to require:', modulePath);
        AppModule = require(modulePath);
        console.log('Successfully loaded from:', modulePath);
        break;
      } catch (e) {
        console.log('Failed:', e.message);
      }
    }
    
    if (!AppModule) {
      throw new Error('Could not load AppModule from any path');
    }
    
    const { AppModule: AppModuleExported } = AppModule;
    const ModuleToUse = AppModuleExported || AppModule;
    const app = await NestFactory.create(ModuleToUse, {
      logger: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : false,
      bufferLogs: true,
    });
    app.enableCors({ origin: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', credentials: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const config = new DocumentBuilder().setTitle('WePredict API').setDescription('API para predicciones').setVersion('1.0').addTag('auth', 'Auth').addTag('app', 'App').build();
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
      stack: error.stack
    });
  }
};

