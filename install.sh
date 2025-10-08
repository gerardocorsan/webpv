#!/bin/bash

# Script de instalación rápida

echo "📦 Instalando dependencias..."
echo ""

# Instalar dependencias del frontend
if [ -d "frontend" ]; then
    echo "🎨 Instalando frontend..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend instalado"
fi

# Instalar dependencias del backend
if [ -d "backend" ]; then
    echo "🐍 Instalando backend..."
    cd backend

    # Crear virtual environment si no existe
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi

    # Activar venv e instalar
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate

    cd ..
    echo "✅ Backend instalado"
fi

echo ""
echo "🎉 Instalación completa!"
echo ""
echo "Para iniciar en desarrollo:"
echo "  • Con Docker: docker-compose up"
echo "  • Sin Docker: ./start-dev.sh"
