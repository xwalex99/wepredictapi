#!/bin/bash
set -e

echo "Eliminando node_modules y package-lock.json..."
rm -rf node_modules package-lock.json

echo "Instalando dependencias (con versiones compatibles)..."
npm install

echo "✅ Instalación completada!"
echo ""
echo "Próximos pasos:"
echo "1. npm run start:dev"
echo ""
echo "Endpoints disponibles:"
echo "- POST /auth/register"
echo "- POST /auth/login"
echo "- GET /auth/profile (requiere token)"
