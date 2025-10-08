# webpv - Inteligencia en Punto de Venta

PWA offline-first para asesores de punto de venta.

## 📁 Estructura del Proyecto

```
webpv/
├── frontend/          # React + Vite PWA
├── backend/           # FastAPI REST API
└── docker-compose.yml # Orquestación local
```

## 🚀 Desarrollo Local

### Opción 1: Con Docker (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up

# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Opción 2: Sin Docker

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# http://localhost:8000
```

## 🏗️ Build de Producción

```bash
# 1. Build del frontend
cd frontend
npm run build

# 2. El backend sirve el frontend compilado
cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Acceder a: http://localhost:8000
# (Sirve PWA + API en el mismo servidor)
```

## 📚 Documentación

- **Frontend**: `frontend/README.md` - Arquitectura, componentes, testing
- **Backend**: `backend/README.md` - API endpoints, modelos, deployment
- **API Docs**: http://localhost:8000/docs (Swagger automático)

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test              # Unit tests
npm run test:e2e          # E2E tests

# Backend tests
cd backend
pytest
```

## 🔑 Credenciales de Prueba (Mock)

- **Asesor**: ID `A012345` / Password `demo123`
- **Supervisor**: ID `A067890` / Password `test456`

## 🌐 Variables de Entorno

**Frontend** (`.env`):
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FF_APIS_MOCK=false
```

**Backend** (`.env`):
```
APP_ENV=development
DATABASE_URL=postgresql://user:pass@localhost/webpv
SECRET_KEY=your-secret-key
```

## 📦 Deploy

Ver guías específicas:
- Frontend PWA: `frontend/docs/deployment.md`
- Backend API: `backend/docs/deployment.md`

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, IndexedDB, Service Workers
- **Backend**: FastAPI, Python 3.11+, PostgreSQL, Redis
- **DevOps**: Docker, Docker Compose
