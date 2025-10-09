# webpv Backend - M1 Implementation

Backend API for webpv PWA application.

## Architecture

- **Framework**: FastAPI + Python 3.11+
- **Databases**:
  - **SQL Server**: Legacy data (read-only) - rutas, clientes, ventas
  - **Firestore**: App database - usuarios, tokens, configuración
- **Authentication**: JWT tokens with refresh token rotation
- **Logging**: Structured JSON logs

## Prerequisites

1. **Python 3.11+**
2. **SQL Server** running on port 1433 with `mbaFerguez` database
3. **Firestore Emulator** (for local development):
   ```bash
   gcloud emulators firestore start
   ```

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Update values in `.env`:
```env
# SQL Server (adjust to your local setup)
MSSQL_SERVER=localhost
MSSQL_PORT=1433
MSSQL_USER=sa
MSSQL_PASSWORD=YourPassword
MSSQL_DATABASE=mbaFerguez

# Firestore Emulator
FIRESTORE_EMULATOR_HOST=localhost:8910
FIRESTORE_PROJECT_ID=webpv-dev

# Security
SECRET_KEY=your-secret-key-change-this-to-something-random
```

### 3. Start Firestore Emulator

```bash
gcloud emulators firestore start
# Should show: API endpoint: http://[::1]:8910
```

### 4. Seed Firestore with Test Data

```bash
python -m app.db.seed_firestore
```

This creates test users:
- **Asesor**: ID `A012345` / Password `demo123` / Ruta `001`
- **Supervisor**: ID `A067890` / Password `test456` / Ruta `002`

### 5. Run Development Server

```bash
uvicorn app.main:app --reload
```

API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Authentication
```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "id": "A012345",
  "password": "demo123",
  "rememberMe": true
}

# Refresh Token
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Route Planning
```bash
# Get route plan (requires authentication)
GET /api/plan-de-ruta?fecha=2025-09-01
Authorization: Bearer <your-jwt-token>
```

## Testing

### Automated Tests

Run all tests:
```bash
pytest
```

Run specific test file:
```bash
pytest tests/test_auth.py
pytest tests/test_route_planning.py
pytest tests/test_security.py
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

Run only unit tests:
```bash
pytest -m unit
```

**Note**: Tests require Firestore emulator to be running:
```bash
# In another terminal
gcloud emulators firestore start
```

### Manual Testing with curl

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"id":"A012345","password":"demo123","rememberMe":true}'

# Save the token from response

# 2. Get route plan
curl -X GET "http://localhost:8000/api/plan-de-ruta?fecha=2025-09-01" \
  -H "Authorization: Bearer <your-token>"
```

### Test with Swagger UI

1. Go to http://localhost:8000/docs
2. Click "Authorize" button
3. Login using `/api/auth/login` endpoint
4. Copy the token from response
5. Click "Authorize" and paste: `Bearer <token>`
6. Test other endpoints

## Project Structure

```
backend/app/
├── core/
│   ├── config.py          # Environment configuration
│   ├── security.py        # JWT & password hashing
│   └── logging.py         # Structured logging
├── db/
│   ├── mssql_client.py    # SQL Server connection
│   ├── firestore_client.py # Firestore connection
│   └── seed_firestore.py  # Seed script
├── api/
│   ├── auth.py            # Authentication endpoints
│   ├── route_planning.py  # Route planning endpoints
│   ├── health.py          # Health check
│   └── dependencies.py    # Shared dependencies (get_current_user)
├── middleware/
│   ├── error_handler.py   # Error formatting
│   ├── security.py        # Security headers
│   └── request_id.py      # Request tracking
├── schemas/
│   ├── auth.py            # Auth Pydantic models
│   ├── route.py           # Route Pydantic models
│   └── common.py          # Common models
├── services/
│   ├── auth_service.py    # Auth business logic
│   └── route_service.py   # Route business logic
└── main.py                # FastAPI application

docs/queries/
└── HOJA_DE_VISITA.sql     # SQL query for route data
```

## Key Features

### ✅ M1 Complete
- [x] JWT authentication with refresh tokens
- [x] Password hashing with bcrypt
- [x] Rate limiting (5 attempts / 15 min)
- [x] Account lockout after 5 failed attempts
- [x] SQL Server integration (route data)
- [x] Firestore integration (users, tokens)
- [x] Route plan endpoint with recommendations
- [x] Security headers
- [x] Structured logging (JSON)
- [x] Error handling (standardized responses)
- [x] Request ID tracking

### 🔄 M2 Planned
- [ ] POST /api/feedback (with idempotency)
- [ ] POST /api/finalizar-visita (with geo validation)
- [ ] Idempotency middleware
- [ ] CSP and HSTS headers
- [ ] Unit tests
- [ ] Integration tests

### 🔮 M3 Planned
- [ ] POST /api/quiebres
- [ ] POST /api/inventario
- [ ] Feature flags system
- [ ] Advanced observability

## Troubleshooting

### SQL Server Connection Issues

**Error**: `pymssql.OperationalError: (20009, ...)`

**Solution**: Verify SQL Server is running and credentials are correct:
```bash
# Test connection manually
python -c "import pymssql; pymssql.connect(server='localhost', user='sa', password='YourPassword', database='mbaFerguez')"
```

**Alternative**: If you prefer `pyodbc`, install Python dev headers first:
```bash
sudo apt-get install python3-dev
pip install pyodbc
# Then update mssql_client.py to use pyodbc instead of pymssql
```

### Firestore Emulator Not Found

**Error**: `Failed to initialize Firestore client`

**Solution**: Make sure emulator is running and `FIRESTORE_EMULATOR_HOST` is set:
```bash
export FIRESTORE_EMULATOR_HOST=localhost:8910
gcloud emulators firestore start
```

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**: Run from backend directory:
```bash
cd backend
python -m app.db.seed_firestore
# OR
uvicorn app.main:app --reload
```

## Development

### Re-seed Database

To clear and re-seed Firestore:
```bash
python -m app.db.seed_firestore --clear
```

### View Logs

Logs are in JSON format. To pretty-print:
```bash
uvicorn app.main:app --reload | jq
```

### Check API Health

```bash
curl http://localhost:8000/api/health | jq
```

## Production Deployment

1. **Build frontend**:
   ```bash
   cd ../frontend
   npm run build
   ```

2. **Set environment variables** (use production values)

3. **Run with production settings**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

4. **Frontend is served from `/` by FastAPI** (reads from `../frontend/dist`)

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (development/production) | `development` |
| `DEBUG` | Enable debug mode | `True` |
| `MSSQL_SERVER` | SQL Server host | `localhost` |
| `MSSQL_PORT` | SQL Server port | `1433` |
| `MSSQL_USER` | SQL Server user | `sa` |
| `MSSQL_PASSWORD` | SQL Server password | `` |
| `MSSQL_DATABASE` | SQL Server database | `mbaFerguez` |
| `FIRESTORE_EMULATOR_HOST` | Firestore emulator (dev only) | `localhost:8910` |
| `FIRESTORE_PROJECT_ID` | Firestore project ID | `webpv-dev` |
| `SECRET_KEY` | JWT secret key | (change in production) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiration | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiration | `7` |

## License

Proprietary
