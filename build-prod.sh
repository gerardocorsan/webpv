#!/bin/bash
# Script para build de producción

set -e

echo "🏗️  Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build completo!"
echo "Para deployar, ejecuta el backend:"
echo "  cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000"
