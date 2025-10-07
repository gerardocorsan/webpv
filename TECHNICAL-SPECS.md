# Technical Specifications - webpv PWA

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [IndexedDB Schema](#indexeddb-schema)
4. [Service Worker & Caching](#service-worker--caching)
5. [Offline Queue System](#offline-queue-system)
6. [API Contracts](#api-contracts)
7. [Authentication & Security](#authentication--security)
8. [Feature Flags](#feature-flags)
9. [Performance Requirements](#performance-requirements)
10. [Observability](#observability)
11. [Accessibility](#accessibility)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PWA Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   UI Layer   │  │ State Mgmt   │  │  Services    │     │
│  │  (React)     │←→│              │←→│              │     │
│  └──────────────┘  └──────────────┘  └──────┬───────┘     │
│                                              │              │
│  ┌──────────────────────────────────────────┴─────────┐   │
│  │           Service Worker                            │   │
│  │  ┌────────────────┐  ┌───────────────────────┐    │   │
│  │  │ Cache Strategy │  │   Background Sync     │    │   │
│  │  └────────────────┘  └───────────────────────┘    │   │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │              IndexedDB                             │    │
│  │  • PlanDeRuta  • FeedbackPendiente                │    │
│  │  • Clientes    • InventarioPendiente              │    │
│  │  • Recomendaciones • CierresPendientes            │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP(S)
┌─────────────────────────────────────────────────────────────┐
│                      Backend APIs                            │
│  • Auth Service                                              │
│  • Route Planning Service                                    │
│  • Feedback Service                                          │
│  • Market Intelligence Service                               │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Offline-First**: UI must function without network connectivity
2. **Progressive Enhancement**: Core features work everywhere, enhanced features where supported
3. **Queue-Based Sync**: All writes queue locally and sync when possible
4. **Idempotency**: All mutations use idempotency keys to prevent duplicates
5. **Optimistic UI**: Show immediate feedback, reconcile on sync

---

## Frontend Architecture

### Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Context API / Zustand (TBD)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Date/Time**: date-fns
- **UI Components**: TBD (Tailwind CSS / Material UI / Custom)

### Feature Module Structure

```
src/features/{feature-name}/
├── components/           # Feature-specific components
├── hooks/               # Feature-specific hooks
├── services/            # API calls, business logic
├── stores/              # Feature state
├── types/               # TypeScript types
├── utils/               # Feature utilities
└── index.ts             # Public API
```

### State Management Strategy

- **Server State**: React Query / SWR for API data
- **Client State**: Context API for global UI state
- **Offline Queue**: Zustand store for pending operations
- **Form State**: React Hook Form

---

## IndexedDB Schema

### Database Name: `webpv-db`

### Version Management

Use versioned migrations:
```typescript
const DB_VERSION = 1;
const DB_NAME = 'webpv-db';
```

### Object Stores

#### 1. PlanDeRuta
Stores daily route plan.

```typescript
interface PlanDeRuta {
  id: string;              // UUID from server
  fecha: string;           // ISO date (YYYY-MM-DD)
  asesorId: string;
  clientes: string[];      // Array of client IDs
  metadata: {
    sincronizadoEn: string; // ISO timestamp
    version: number;
  };
}

// Index: fecha (unique)
```

#### 2. Clientes
Client master data.

```typescript
interface Cliente {
  id: string;              // UUID from server
  codigo: string;          // Business code
  nombre: string;
  direccion: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  segmento: string;
  estatus: 'activo' | 'inactivo' | 'suspendido';
  metadata: {
    ultimaVisita?: string; // ISO timestamp
    sincronizadoEn: string;
  };
}

// Indexes: id (unique), codigo (unique)
```

#### 3. Recomendaciones
Visit recommendations per client.

```typescript
interface Recomendacion {
  id: string;
  clienteId: string;
  tipo: 'venta' | 'cobranza' | 'merchandising' | 'informacion';
  prioridad: 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  razonVisita: string;     // "Why" this visit
  sku?: string;
  metadata: {
    validaHasta: string;   // ISO date
    sincronizadoEn: string;
  };
}

// Indexes: clienteId, prioridad
```

#### 4. FeedbackPendiente
Queued feedback awaiting sync.

```typescript
interface FeedbackPendiente {
  id: string;              // Local UUID
  idempotencyKey: string;  // For deduplication
  recomendacionId: string;
  clienteId: string;
  resultado: 'aceptada' | 'rechazada' | 'parcial';
  motivo?: string;         // Required if rejected
  nota?: string;
  timestamp: string;       // ISO timestamp (local)
  estado: 'pendiente' | 'enviando' | 'error' | 'enviado';
  intentos: number;
  proximoReintento?: string; // ISO timestamp
  error?: string;
}

// Indexes: estado, proximoReintento
```

#### 5. InventarioPendiente
Queued inventory updates.

```typescript
interface InventarioPendiente {
  id: string;
  idempotencyKey: string;
  clienteId: string;
  tipo: 'propio' | 'competencia';
  items: Array<{
    sku: string;
    marca: string;
    existencia?: number;
    precio?: number;
    facing?: number;
    nivel?: 'alto' | 'medio' | 'bajo';
  }>;
  observaciones?: string;
  timestamp: string;
  estado: 'pendiente' | 'enviando' | 'error' | 'enviado';
  intentos: number;
  proximoReintento?: string;
  error?: string;
}

// Indexes: estado, proximoReintento
```

#### 6. QuiebresPendientes
Queued stockout reports.

```typescript
interface QuiebrePendiente {
  id: string;
  idempotencyKey: string;
  clienteId: string;
  skus: string[];          // Array of SKUs out of stock
  timestamp: string;
  estado: 'pendiente' | 'enviando' | 'error' | 'enviado';
  intentos: number;
  proximoReintento?: string;
  error?: string;
}

// Indexes: estado, proximoReintento
```

#### 7. CierresPendientes
Queued visit closures.

```typescript
interface CierrePendiente {
  id: string;
  idempotencyKey: string;
  clienteId: string;
  coordenadas?: {
    lat: number;
    lng: number;
    precision: number;
  };
  capturaCoordenadas: 'automatica' | 'manual';
  justificativoGeo?: string; // Required if manual
  resumen: {
    tareasCompletadas: number;
    tareasPendientes: number;
    feedbacksRegistrados: number;
  };
  notas?: string;
  timestamp: string;
  estado: 'pendiente' | 'enviando' | 'error' | 'enviado';
  intentos: number;
  proximoReintento?: string;
  error?: string;
}

// Indexes: estado, proximoReintento
```

#### 8. Configuracion
App configuration and feature flags.

```typescript
interface Configuracion {
  clave: string;           // Key (unique)
  valor: any;              // JSON value
  actualizadoEn: string;
}

// Index: clave (unique)
```

---

## Service Worker & Caching

### Service Worker Lifecycle

```javascript
// public/service-worker.js
const CACHE_VERSION = 'v1.0.0';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/main.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];
```

### Caching Strategies

#### 1. App Shell (Precache)
Strategy: **Cache-First**

```javascript
self.addEventListener('fetch', (event) => {
  if (APP_SHELL_FILES.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

#### 2. API Calls

**Route Plan (GET /plan-de-ruta)**: Network-First with fallback
```javascript
// Try network first, fallback to cache, max age 24h
```

**Feedback/Inventory/Closures (POST)**: Network-Only + Queue
```javascript
// Always attempt network, queue on failure
```

#### 3. Static Assets
Strategy: **Stale-While-Revalidate**

```javascript
// Images, fonts: serve from cache, update in background
```

### Cache Invalidation

- Increment `CACHE_VERSION` on every release
- Delete old caches in `activate` event:

```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
});
```

---

## Offline Queue System

### Queue Architecture

```typescript
interface QueueItem {
  id: string;
  type: 'feedback' | 'inventario' | 'quiebre' | 'cierre';
  payload: any;
  idempotencyKey: string;
  createdAt: string;
  attempts: number;
  nextRetry?: string;
  status: 'pending' | 'sending' | 'error' | 'sent';
  error?: string;
}
```

### Retry Strategy

**Exponential Backoff**:
```typescript
const getRetryDelay = (attempts: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 60000; // 60 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay);
  return delay + Math.random() * 1000; // Add jitter
};
```

**Retry Limits**:
- Max attempts: 10
- After 10 failures: Mark as "requires manual review"

### Queue Processing

**Triggers**:
1. On network reconnection (online event)
2. On explicit "Sync Now" button
3. On page visibility change (tab becomes active)
4. Background Sync API (if available)

**Processing Logic**:
```typescript
async function processQueue() {
  const items = await getQueueItems({ status: 'pending', nextRetry: { $lte: now() } });

  for (const item of items) {
    try {
      await sendToServer(item);
      await markAsSent(item.id);
    } catch (error) {
      await markAsError(item.id, error, getRetryDelay(item.attempts));
    }
  }
}
```

### Idempotency

All POST requests include header:
```
X-Idempotency-Key: <uuid>
```

Server guarantees:
- Same idempotency key = same response (within 24h window)
- 409 Conflict if already processed
- 200/201 OK with same result

---

## API Contracts

### Base URL
```
https://api.example.com/v1
```

### Authentication
All requests (except login) include:
```
Authorization: Bearer <jwt-token>
```

### Common Headers
```
Content-Type: application/json
X-Idempotency-Key: <uuid>  (for POST/PUT/PATCH)
X-Request-ID: <uuid>
```

---

### 1. Authentication

#### POST /auth/login

**Request**:
```json
{
  "id": "asesor123",
  "password": "***",
  "rememberMe": true
}
```

**Response (200 - Success)**:
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "refresh-token",
  "expiresIn": 3600,
  "user": {
    "id": "asesor123",
    "nombre": "Juan Pérez",
    "rol": "asesor"
  }
}
```

**Response (400 - Bad Request)**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Datos de entrada inválidos",
  "details": {
    "id": "El ID es requerido",
    "password": "La contraseña es requerida"
  }
}
```

Causes:
- Missing required fields (`id` or `password`)
- Invalid field format
- `rememberMe` is not a boolean

**Response (401 - Unauthorized)**:
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Credenciales inválidas"
}
```

Causes:
- Incorrect ID or password
- User does not exist

**Response (403 - Forbidden)**:
```json
{
  "error": "ACCOUNT_BLOCKED",
  "message": "Cuenta bloqueada. Contacte al administrador"
}
```

Causes:
- Account is blocked/suspended
- Account is inactive
- Too many failed login attempts (account locked)

**Response (429 - Too Many Requests)**:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Demasiados intentos. Intente nuevamente en 5 minutos",
  "retryAfter": 300
}
```

Causes:
- Rate limit exceeded (5 attempts per minute per IP)

**Response (500 - Internal Server Error)**:
```json
{
  "error": "INTERNAL_ERROR",
  "message": "Error interno del servidor. Intente nuevamente"
}
```

**Response (503 - Service Unavailable)**:
```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Servicio temporalmente no disponible"
}
```

**Client-Side Error Handling**:
- **Network Timeout**: 30 seconds
- **Network Failure**: Retry with exponential backoff (max 3 attempts)
- **Malformed Response**: Log error and show generic message

**Security Notes**:
- Password is transmitted over HTTPS only
- Failed attempts are logged and monitored
- Account lockout after 5 failed attempts within 15 minutes
- Lockout duration: 30 minutes

---

#### POST /auth/refresh
Request:
```json
{
  "refreshToken": "refresh-token"
}
```

Response (200):
```json
{
  "token": "eyJhbGc...",
  "expiresIn": 3600
}
```

---

### 2. Route Planning

#### GET /plan-de-ruta?fecha=2025-09-30
Response (200):
```json
{
  "id": "plan-uuid",
  "fecha": "2025-09-30",
  "asesorId": "asesor123",
  "clientes": [
    {
      "id": "cliente-1",
      "codigo": "C001",
      "nombre": "Tienda El Sol",
      "direccion": "Calle Principal 123",
      "coordenadas": { "lat": 19.4326, "lng": -99.1332 },
      "razonVisita": "Seguimiento pedido",
      "prioridad": "alta"
    }
  ],
  "recomendaciones": [
    {
      "id": "rec-1",
      "clienteId": "cliente-1",
      "tipo": "venta",
      "prioridad": "alta",
      "titulo": "Ofrecer SKU-123",
      "descripcion": "Cliente tiene historial de compra de esta categoría",
      "sku": "SKU-123"
    }
  ]
}
```

---

### 3. Feedback

#### POST /feedback
Request:
```json
{
  "idempotencyKey": "uuid",
  "recomendacionId": "rec-1",
  "clienteId": "cliente-1",
  "resultado": "aceptada",
  "motivo": null,
  "nota": "Cliente ordenó 10 unidades",
  "timestamp": "2025-09-30T14:30:00Z"
}
```

Response (201):
```json
{
  "id": "feedback-uuid",
  "status": "registrado",
  "mensaje": "Feedback registrado exitosamente"
}
```

Response (409 - Already processed):
```json
{
  "id": "feedback-uuid",
  "status": "duplicado",
  "mensaje": "Este feedback ya fue registrado"
}
```

---

### 4. Market Intelligence

#### POST /quiebres
Request:
```json
{
  "idempotencyKey": "uuid",
  "clienteId": "cliente-1",
  "skus": ["SKU-123", "SKU-456"],
  "timestamp": "2025-09-30T14:35:00Z"
}
```

Response (201):
```json
{
  "id": "quiebre-uuid",
  "status": "registrado"
}
```

#### POST /inventario
Request:
```json
{
  "idempotencyKey": "uuid",
  "clienteId": "cliente-1",
  "tipo": "propio",
  "items": [
    {
      "sku": "SKU-123",
      "marca": "Marca A",
      "existencia": 15,
      "precio": 25.50,
      "facing": 3
    }
  ],
  "observaciones": "Buen nivel de inventario",
  "timestamp": "2025-09-30T14:40:00Z"
}
```

Response (201):
```json
{
  "id": "inventario-uuid",
  "status": "registrado"
}
```

---

### 5. Visit Closure

#### POST /finalizar-visita
Request:
```json
{
  "idempotencyKey": "uuid",
  "clienteId": "cliente-1",
  "coordenadas": {
    "lat": 19.4326,
    "lng": -99.1332,
    "precision": 10
  },
  "capturaCoordenadas": "automatica",
  "resumen": {
    "tareasCompletadas": 3,
    "tareasPendientes": 1,
    "feedbacksRegistrados": 2
  },
  "notas": "Visita exitosa",
  "timestamp": "2025-09-30T15:00:00Z"
}
```

Response (201):
```json
{
  "id": "cierre-uuid",
  "status": "registrado",
  "duracionVisita": 1800
}
```

---

### 6. Health Check

#### GET /health
Response (200):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-09-30T15:05:00Z"
}
```

---

## Authentication & Security

### Token Management

- **Access Token**: JWT, 1 hour expiry
- **Refresh Token**: Opaque, 7 days expiry (with "remember me")
- Storage: `IndexedDB` (not localStorage for security)

### Token Refresh Flow

```typescript
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const newToken = await refreshAuthToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Security Headers

**Required on all responses**:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CORS Policy

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Idempotency-Key
Access-Control-Max-Age: 86400
```

### Data Protection

- **Sensitive data**: Never log passwords, tokens, or PII
- **Encryption at rest**: IndexedDB data encrypted on device (OS-level)
- **HTTPS only**: Enforce HTTPS in production, no mixed content

---

## Feature Flags

### Flag Configuration

Stored in `Configuracion` IndexedDB store and synced from server.

```typescript
interface FeatureFlags {
  ff_inteligencia_competencia: boolean;
  ff_geo_validacion: boolean;
  ff_geo_validacion_precision_minima: number; // meters
  ff_apis_mock: boolean;
  ff_background_sync: boolean;
  ff_offline_mode: boolean;
}
```

### Flag Evaluation

```typescript
const isFeatureEnabled = (flag: string): boolean => {
  return getConfigValue(flag) === true;
};

// Usage
if (isFeatureEnabled('ff_inteligencia_competencia')) {
  // Show competitor intelligence UI
}
```

### Flag Override (Dev Only)

Allow localStorage override in development:
```typescript
const flagOverride = localStorage.getItem(`flag:${flagName}`);
if (import.meta.env.DEV && flagOverride !== null) {
  return flagOverride === 'true';
}
```

---

## Performance Requirements

### Performance Budgets

| Metric | Target | Max |
|--------|--------|-----|
| **First Contentful Paint (FCP)** | ≤ 1.5s | 2.0s |
| **Largest Contentful Paint (LCP)** | ≤ 2.5s | 3.0s |
| **Time to Interactive (TTI)** | ≤ 3.5s | 4.5s |
| **Cumulative Layout Shift (CLS)** | ≤ 0.1 | 0.15 |
| **Initial Bundle Size (gzip)** | ≤ 200KB | 300KB |
| **Total Bundle Size (gzip)** | ≤ 500KB | 700KB |

### Device Targets

- **Primary**: Mid-range Android (4GB RAM, 4G connection)
- **Minimum**: Android 8+, iOS 13+
- **Network**: Test on "Fast 3G" throttling

### Optimization Strategies

1. **Code Splitting**: Route-based lazy loading
2. **Tree Shaking**: Remove unused code
3. **Image Optimization**: WebP format, responsive images
4. **Font Loading**: Subset fonts, font-display: swap
5. **Prefetching**: Prefetch next route on hover/focus
6. **Virtual Scrolling**: For long lists (daily list, inventory)

### Bundle Analysis

```bash
npm run build:analyze
```

Monitor:
- Third-party dependencies size
- Duplicate dependencies
- Unused exports

---

## Observability

### Metrics Collection

#### Frontend Metrics

**Web Vitals**:
```typescript
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => sendToAnalytics('CLS', metric.value));
getLCP(metric => sendToAnalytics('LCP', metric.value));
// etc.
```

**Custom Metrics**:
- PWA installation rate
- Offline sessions duration
- Queue drain time
- Sync success/failure rate

#### Business Events

```typescript
interface BusinessEvent {
  event: string;
  timestamp: string;
  userId: string;
  properties: Record<string, any>;
}

// Examples
trackEvent('feedback_captured', { resultado: 'aceptada', offline: true });
trackEvent('visit_finalized', { duracion: 1800, tareasCompletadas: 3 });
trackEvent('sync_completed', { itemsEnviados: 5, itemsFallidos: 0 });
```

#### Error Tracking

```typescript
window.addEventListener('error', (event) => {
  logError({
    message: event.message,
    stack: event.error?.stack,
    url: event.filename,
    line: event.lineno,
    column: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logError({
    message: event.reason?.message || 'Unhandled Promise Rejection',
    stack: event.reason?.stack
  });
});
```

### Logging

**Structured Logs**:
```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context: Record<string, any>;
  userId?: string;
  sessionId: string;
}
```

**Log Levels**:
- `debug`: Development only
- `info`: Key user actions (login, sync, visit)
- `warn`: Recoverable errors (retries, fallbacks)
- `error`: Unrecoverable errors

**Never Log**:
- Passwords or credentials
- Full tokens (log last 4 chars only)
- PII without consent

### Dashboards

**Key Metrics** (see `docs/checklist-runbook.md` for details):
- API error rate and latency
- Frontend errors (JS errors, LCP, CLS)
- Offline queue metrics (pending items, drain time)
- Business metrics (visits, feedback, conversion)

---

## Accessibility

### Requirements

- **WCAG 2.1 Level AA** compliance
- **Axe-core**: Zero critical issues
- **Keyboard Navigation**: All interactions accessible via keyboard
- **Screen Reader**: Proper ARIA labels and landmarks
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text

### Testing

```bash
npm run test:a11y
```

Uses:
- axe-core for automated checks
- Manual testing with screen reader (NVDA/JAWS)
- Keyboard-only navigation test

### Touch Targets

- Minimum size: 44x44px (iOS), 48x48dp (Android)
- Spacing: 8px between interactive elements

### Focus Management

- Visible focus indicators
- Logical tab order
- Focus trap in modals
- Focus restoration after navigation

---

## Appendix

### Related Documentation

- **Project Plan**: `docs/plan-and-wbs.md`
- **User Stories**: `docs/backlog.csv`
- **Operations**: `docs/checklist-runbook.md`
- **Developer Guide**: `CLAUDE.md`

### Glossary

- **Asesor**: Field sales representative
- **Quiebre**: Stockout (SKU not available at point of sale)
- **Facing**: Number of product units visible on shelf
- **Plan de Ruta**: Daily route plan with client visits
- **Inteligencia de Mercado**: Market intelligence (inventory, competitors)

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-09-30 | Initial specification |
