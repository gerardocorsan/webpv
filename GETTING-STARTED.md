# Getting Started with webpv

## ✅ Proyecto Inicializado

El scaffold del proyecto está completo y listo para desarrollo.

## 📋 Qué se ha creado

### Configuración del Proyecto
- ✅ `package.json` con todas las dependencias
- ✅ TypeScript configurado (modo strict)
- ✅ Vite + React + SWC
- ✅ ESLint + Prettier
- ✅ PWA plugin configurado
- ✅ Vitest (unit tests) + Playwright (E2E)

### Estructura de Código
- ✅ Estructura de carpetas modular (`src/features/*`)
- ✅ IndexedDB wrapper con migraciones versionadas
- ✅ Sistema de tipos TypeScript completo
- ✅ Utilidades (logger, config, helpers)
- ✅ Service Worker (vía Vite PWA plugin)

### CI/CD
- ✅ GitHub Actions workflow (lint, test, build, e2e)

### Documentación
- ✅ README.md - Documentación general
- ✅ CLAUDE.md - Guía para Claude Code
- ✅ TECHNICAL-SPECS.md - Especificaciones técnicas detalladas

## 🚀 Siguiente Paso: Desarrollo

### 1. Crear archivo .env

```bash
cp .env.example .env
```

Editar `.env` según tu entorno (APIs mock habilitadas por defecto).

### 2. Generar íconos PWA

Colocar íconos PNG en `public/icons/` con los tamaños especificados en `public/icons/README.md`.

Puedes generarlos con:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará en `http://localhost:5173`

### 4. Verificar que todo funciona

```bash
# Type check
npm run type-check

# Tests unitarios
npm run test

# Tests E2E (requiere app corriendo)
npm run test:e2e
```

## 📝 Implementar Features (M1 - Semana 1)

Según `docs/plan-and-wbs.md`, los entregables de M1 son:

### Prioridad Alta (Must-Have):

1. **US-A1: Login** (`src/features/auth/`)
   - Implementar pantalla de login
   - Validación de credenciales
   - Persistencia de sesión en IndexedDB
   - Modo offline si ya hay sesión

2. **US-B1: Sincronización Inicial** (`src/features/sync/`)
   - Pantalla con progreso de sync
   - Descargar: plan de ruta, clientes, recomendaciones
   - Guardar en IndexedDB
   - Manejo de errores y reintentos

3. **US-C1: Lista del Día** (`src/features/daily-list/`)
   - Listar clientes desde IndexedDB
   - Mostrar "porqué" de la visita
   - Filtros básicos
   - Banner de estado offline

4. **Observabilidad Básica** (`src/utils/logger.ts`)
   - Logs estructurados (ya implementado)
   - Métricas de sync (agregar)
   - Health check endpoint (backend)

### Orden Sugerido:

```
1. Implementar US-A1 (Login)
2. Implementar US-B1 (Sync)
3. Implementar US-C1 (Lista)
4. Tests E2E del flujo Login → Sync → Lista
5. Telemetría y observabilidad
```

## 🧪 Testing

### Unit Tests

```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

Ubicación: `src/**/__tests__/*.test.ts`

### E2E Tests

```bash
npm run test:e2e          # Headless
npm run test:e2e:headed   # Con UI
npm run test:e2e:debug    # Modo debug
npm run test:e2e:ui       # Playwright UI
```

Ubicación: `e2e/*.spec.ts`

## 📦 Build

```bash
npm run build             # Build de producción
npm run preview           # Preview del build
npm run build:analyze     # Análisis de bundle
```

## 🔧 Herramientas de Desarrollo

### VSCode (Recomendado)

El proyecto incluye configuración de VSCode (`.vscode/`):
- Format on save (Prettier)
- ESLint auto-fix
- Extensiones recomendadas

### Feature Flags (Desarrollo)

Puedes override flags en localStorage:

```javascript
localStorage.setItem('flag:ff_inteligencia_competencia', 'true');
localStorage.setItem('flag:ff_apis_mock', 'false');
```

## 📚 Recursos

- **Backlog**: `docs/backlog.csv`
- **Plan**: `docs/plan-and-wbs.md`
- **Runbook**: `docs/checklist-runbook.md`
- **Specs Técnicas**: `TECHNICAL-SPECS.md`

## ⚠️ Checklist antes de empezar

- [ ] Dependencias instaladas (`npm install` ejecutado)
- [ ] Archivo `.env` creado
- [ ] Type check pasa (`npm run type-check`)
- [ ] Tests pasan (`npm run test`)
- [ ] App corre en dev (`npm run dev`)
- [ ] Revisado backlog (`docs/backlog.csv`)
- [ ] Revisado plan M1 (`docs/plan-and-wbs.md`)

## 🎯 Meta M1 (Fin Semana 1)

**Walking skeleton en producción**:
- ✅ PWA instalable con SW activo
- ⏳ Login funcional (mock o real)
- ⏳ Sync inicial descarga datasets
- ⏳ Lista del día visible
- ⏳ CI/CD desplegando a staging
- ⏳ Observabilidad básica activa

---

**¡Listo para desarrollar!** 🚀

Comienza con `npm run dev` y empieza a implementar US-A1 (Login).
