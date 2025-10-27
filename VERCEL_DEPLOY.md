# Despliegue en Vercel

## Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en el dashboard de Vercel:

```bash
DB_HOST=db.evoxdssbeohlsdtqutyn.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=v8GBNBUQ0DCTVY59
DB_NAME=postgres
DB_SSL=require
GOOGLE_CLIENT_ID=1093381928939-2vls7fds1i29it663k81nvnbbdbsak6d.apps.googleusercontent.com
NODE_ENV=production
```

## Configuración

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Install Command**: `npm install`

## Importante

- La carpeta `dist` debe estar en el repositorio
- El archivo `api/index.js` es el entry point para las serverless functions
- Swagger no estará disponible en `/api` en producción, usar los endpoints directamente

## Troubleshooting

Si ves error 500:
1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs en el dashboard de Vercel
3. Asegúrate de que la base de datos esté accesible desde internet

