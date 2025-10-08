#!/bin/bash

# Script para iniciar desarrollo local (sin Docker)

echo "🚀 Iniciando entorno de desarrollo..."
echo ""

# Función para matar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Verificar que las dependencias están instaladas
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Dependencias de frontend no instaladas. Ejecuta: cd frontend && npm install"
    exit 1
fi

if [ ! -d "backend/venv" ]; then
    echo "❌ Virtual env de backend no existe. Ejecuta: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Iniciar frontend
echo "🎨 Iniciando frontend (http://localhost:5173)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Esperar un poco
sleep 2

# Iniciar backend
echo "🐍 Iniciando backend (http://localhost:8000)..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo ""
echo "✅ Servicios iniciados:"
echo "  • Frontend: http://localhost:5173"
echo "  • Backend:  http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"
echo ""

# Esperar a que se detengan
wait
