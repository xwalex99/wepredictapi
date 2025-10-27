import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    // Dynamic import to load compiled module
    // Path corrected: from dist/api/ we go up one level (../) then into src/
    const { getApp } = require('../src/main.vercel');
    const app = await getApp();
    const httpAdapter = app.getHttpAdapter();
    
    // Usa el adaptador HTTP de Nest para delegar a Express
    const expressApp = httpAdapter.getInstance();
    
    // Redirige la request de Vercel a Nest
    return expressApp(req, res);
  } catch (err: any) {
    console.error('Serverless error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

