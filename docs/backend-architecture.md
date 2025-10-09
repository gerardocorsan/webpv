# Backend Architecture - webpv

## Overview

The webpv backend is a FastAPI application that serves as a bridge between:
1. **SQL Server** (legacy database with route and sales data - read-only)
2. **Firestore** (app database for users, sessions, and configuration)
3. **React PWA Frontend** (consuming REST APIs)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (PWA)                          │
│                     React + IndexedDB + SW                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS/JSON
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (M1)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                            │  │
│  │  • POST /api/auth/login                                   │  │
│  │  • POST /api/auth/refresh                                 │  │
│  │  • GET  /api/plan-de-ruta                                 │  │
│  │  • GET  /api/health                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware                                               │  │
│  │  • Error Handler (standardized responses)                │  │
│  │  • Security Headers (CORS, X-Frame-Options, etc.)        │  │
│  │  • Request ID tracking                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                                │  │
│  │  • auth_service: Authentication, rate limiting            │  │
│  │  • route_service: Route planning, recommendations         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Core                                                      │  │
│  │  • security: JWT, bcrypt, refresh tokens                  │  │
│  │  • config: Environment variables                          │  │
│  │  • logging: Structured JSON logs                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────┬─────────────────────────────────┬───────────────┘
              │                                 │
              ↓                                 ↓
┌─────────────────────────┐    ┌──────────────────────────────┐
│   SQL Server (Legacy)   │    │  Firestore (App Database)    │
│                         │    │                              │
│  • mbaFerguez DB        │    │  Collections:                │
│  • Tables:              │    │  • users                     │
│    - Rutas              │    │  • refresh_tokens            │
│    - Clientes           │    │  • configuracion             │
│    - Ventas (historial) │    │                              │
│                         │    │  Emulator (dev):             │
│  Port: 1433             │    │  FIRESTORE_EMULATOR_HOST     │
│  Client: pymssql        │    │  Dynamic port (e.g. 8421)    │
│  Access: Read-only      │    │                              │
└─────────────────────────┘    └──────────────────────────────┘
```

## Database Strategy

### Dual Database Architecture

**Why two databases?**
- **SQL Server**: Contains legacy enterprise data (routes, clients, sales history)
  - Replicated from production systems
  - Read-only access for safety
  - Complex queries already defined (see `HOJA_DE_VISITA.sql`)

- **Firestore**: Modern NoSQL for app-specific data
  - User accounts and sessions
  - JWT refresh tokens
  - Application configuration and feature flags
  - Fast, scalable, with offline SDK support

### SQL Server Integration

**Connection**: `pymssql` (chosen over `pyodbc` for easier installation on Linux/WSL)

**Key Query**: `docs/queries/HOJA_DE_VISITA.sql`

This query generates the daily route plan for an advisor:
- Input: `@Ruta` (route code), `@Fecha` (date)
- Output: List of clients to visit with:
  - Client details (name, address, coordinates)
  - Visit reason (based on sales patterns)
  - Historical sales data
  - Recommended products

**Implementation**: `backend/app/db/mssql_client.py`
```python
def execute_hoja_visita_query(ruta: str, fecha: date) -> List[Dict]:
    """
    Executes HOJA_DE_VISITA.sql query against SQL Server
    Returns list of clients and sales data for the route/date
    """
```

### Firestore Schema

**Collection: `users`**
```typescript
{
  id: string,              // User ID (e.g., "A012345")
  nombre: string,          // Full name
  password_hash: string,   // bcrypt hashed password
  rol: "asesor" | "supervisor",
  ruta: string,            // Assigned route code (e.g., "001")
  activo: boolean,         // Account active flag
  bloqueado: boolean,      // Account locked flag
  intentos_fallidos: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

**Collection: `refresh_tokens`**
```typescript
{
  [token]: {
    user_id: string,
    expires_at: timestamp,
    created_at: timestamp,
    revoked: boolean,
    revoked_at?: timestamp
  }
}
```

**Collection: `configuracion`**
```typescript
{
  [key]: {
    value: any,
    updated_at: timestamp
  }
}
```

## Authentication Flow

### Login Flow

```
1. POST /api/auth/login
   ├─→ auth_service.check_rate_limit()
   ├─→ firestore_client.get_user_by_id()
   ├─→ security.verify_password()
   ├─→ security.create_access_token()
   ├─→ security.generate_refresh_token()
   └─→ firestore_client.save_refresh_token()

2. Response:
   {
     "token": "eyJhbGc...",          // JWT (60 min)
     "refreshToken": "uuid",         // Refresh token (7 days)
     "expiresIn": 3600,
     "user": { ... }
   }
```

### Rate Limiting

**Implementation**: In-memory dictionaries (no Redis required for M1)
- **5 attempts per 15 minutes** per user ID
- Account locked for 15 minutes after limit exceeded
- Permanent block in Firestore after 5 failed password attempts

**Data structures**:
```python
_login_attempts: Dict[str, List[datetime]]  # user_id -> [attempt_times]
_locked_accounts: Dict[str, datetime]       # user_id -> locked_until
```

### Token Refresh Flow

```
1. POST /api/auth/refresh
   ├─→ firestore_client.get_refresh_token()
   ├─→ Validate: not expired, not revoked
   ├─→ firestore_client.get_user_by_id()
   ├─→ security.create_access_token()
   └─→ firestore_client.revoke_refresh_token() (rotation)
       └─→ firestore_client.save_refresh_token() (new token)

2. Response:
   {
     "token": "eyJhbGc...",
     "refreshToken": "new-uuid",
     "expiresIn": 3600
   }
```

## Route Planning Flow

```
1. GET /api/plan-de-ruta?fecha=2025-09-30
   ├─→ dependencies.get_current_user()  (JWT validation)
   ├─→ route_service.get_route_plan()
   │   ├─→ mssql_client.execute_hoja_visita_query()
   │   ├─→ Transform SQL results to Pydantic models
   │   └─→ route_service.generate_recomendaciones()
   └─→ Response: PlanDeRuta model

2. Response structure:
   {
     "id": "uuid",
     "fecha": "2025-09-30",
     "asesorId": "A012345",
     "clientes": [...],
     "recomendaciones": [...]
   }
```

## Security Implementation

### Password Security
- **Hashing**: bcrypt 4.2.1 (compatible with Python 3.13)
- **Cost factor**: 12 rounds (configurable)
- **Validation**: via passlib with bcrypt backend

### JWT Tokens
- **Algorithm**: HS256
- **Access token lifetime**: 60 minutes (configurable)
- **Refresh token lifetime**: 7 days (configurable)
- **Claims**: `sub` (user_id), `rol`, `ruta`, `exp`, `iat`

### Security Headers (Middleware)
```python
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### CORS
- Configured for frontend origin
- Credentials allowed for JWT cookies (if enabled)

## Error Handling

All errors follow standardized format:

```json
{
  "error": "ERROR_CODE",
  "message": "User-friendly message in Spanish",
  "details": { ... }  // Optional
}
```

**Error Codes**:
- `VALIDATION_ERROR` - Invalid input (400)
- `INVALID_CREDENTIALS` - Wrong username/password (401)
- `ACCOUNT_BLOCKED` - Account locked/inactive (403)
- `RATE_LIMIT_EXCEEDED` - Too many attempts (429)
- `INTERNAL_ERROR` - Server error (500)

## Testing Strategy

### Test Environment Setup

**Requirements**:
1. **Firestore Emulator**: `gcloud emulators firestore start`
2. **Environment Variable**: `FIRESTORE_EMULATOR_HOST=[::1]:XXXX`
3. **SQL Server** (optional for integration tests)

### Test Structure

```
backend/tests/
├── conftest.py              # Fixtures, emulator setup
├── test_security.py         # JWT, password hashing (12 tests)
├── test_auth.py             # Auth endpoints (11 tests)
└── test_route_planning.py   # Route planning (15 tests)

Total: 38 tests
```

### Key Fixtures

**`clear_rate_limits`** (autouse):
- Clears in-memory rate limit state between tests
- Prevents test interference

**`setup_firestore_emulator`** (session-scoped):
- Validates Firestore emulator is running
- Parses dynamic port from environment variable
- Supports IPv6 (`[::1]:port`) and IPv4 (`localhost:port`)

**`test_user`**:
- Creates test user in Firestore
- Cleans up after test

### Running Tests

```bash
# Terminal 1
gcloud emulators firestore start

# Terminal 2 (copy export command from Terminal 1)
export FIRESTORE_EMULATOR_HOST=[::1]:8421
pytest
```

Expected output: **38 passed**

## Deployment Considerations

### Environment Variables

**Required for Production**:
```bash
# Security
SECRET_KEY=<random-256-bit-key>

# SQL Server
MSSQL_SERVER=<production-sql-server>
MSSQL_USER=<read-only-user>
MSSQL_PASSWORD=<secure-password>

# Firestore
FIRESTORE_PROJECT_ID=webpv-prod
# (No FIRESTORE_EMULATOR_HOST in production)
```

### Production Checklist

- [ ] Remove/comment `FIRESTORE_EMULATOR_HOST`
- [ ] Use production Firestore project
- [ ] Rotate `SECRET_KEY`
- [ ] Configure SQL Server firewall rules
- [ ] Enable structured logging ingestion
- [ ] Set up monitoring and alerts
- [ ] Configure HTTPS/TLS
- [ ] Review CORS allowed origins

## M1 Implementation Status

### ✅ Completed (M1)

**Endpoints**:
- POST `/api/auth/login` - User authentication
- POST `/api/auth/refresh` - Token refresh
- GET `/api/plan-de-ruta` - Daily route plan
- GET `/api/health` - Health check

**Features**:
- JWT authentication with refresh tokens
- Rate limiting (5 attempts / 15 min)
- Account lockout after failures
- SQL Server integration (HOJA_DE_VISITA.sql)
- Firestore integration (users, tokens)
- Security headers
- Structured logging
- Error handling
- Request ID tracking
- 38 automated tests

### 🔄 Planned (M2)

**Endpoints**:
- POST `/api/feedback` - Client visit feedback (with idempotency)
- POST `/api/finalizar-visita` - Finalize visit (with geo validation)

**Features**:
- Idempotency middleware (prevent duplicate submissions)
- Geolocation validation
- Offline queue support (backend receives queued operations)

### 🔮 Planned (M3)

**Endpoints**:
- POST `/api/quiebres` - Stockout reports
- POST `/api/inventario` - Inventory reports
- GET `/api/inteligencia-competencia` - Competitor intelligence (optional)

**Features**:
- Feature flags system (Firestore-based)
- Advanced observability
- Performance monitoring

## Technical Decisions Log

### Why pymssql instead of pyodbc?

**Problem**: `pyodbc` installation failed on Linux/WSL
```
Building wheels for collected packages: pyodbc
Building wheel for pyodbc (setup.py) ... error
```

**Solution**: Switched to `pymssql`
- Easier installation (no system ODBC drivers needed)
- Pure Python implementation
- Compatible API for basic queries

**Trade-off**: Less feature-rich than pyodbc, but sufficient for M1 read-only queries

### Why bcrypt 4.2.1 separate from passlib?

**Problem**: Python 3.13 compatibility issue
```
ValueError: password cannot be longer than 72 bytes
```

**Solution**: Install `bcrypt==4.2.1` separately from `passlib`
```
bcrypt==4.2.1
passlib==1.7.4
```

**Reason**: The bundled bcrypt in `passlib[bcrypt]` has bugs with Python 3.13

### Why in-memory rate limiting instead of Redis?

**Decision**: Use Python dictionaries for M1
```python
_login_attempts: Dict[str, List[datetime]] = {}
_locked_accounts: Dict[str, datetime] = {}
```

**Pros**:
- No additional infrastructure dependency
- Sufficient for M1 single-instance deployment
- Simple implementation

**Cons**:
- State lost on server restart
- Not suitable for multi-instance deployment

**Migration Path**: M2+ can add Redis if horizontal scaling is needed

### Why dynamic Firestore emulator port?

**Problem**: Tests hardcoded `localhost:8910`, but emulator assigns random port
```
[firestore] API endpoint: http://[::1]:8421
```

**Solution**: Read from `FIRESTORE_EMULATOR_HOST` environment variable
- Supports IPv6 (`[::1]:port`) and IPv4 (`localhost:port`)
- No hardcoded ports
- Copy-paste from emulator output

## References

- **API Contracts**: See `TECHNICAL-SPECS.md`
- **Project Plan**: See `docs/plan-and-wbs.md`
- **Runbook**: See `docs/checklist_runbook.md`
- **Backend README**: See `backend/README.md`
- **SQL Query**: See `docs/queries/HOJA_DE_VISITA.sql`
