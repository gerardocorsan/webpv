# Getting Started with webpv

## ✅ Project Initialized

The project scaffold is complete and ready for development.

## 📋 What's been created

### Project Configuration
- ✅ `package.json` with all dependencies
- ✅ TypeScript configured (strict mode)
- ✅ Vite + React + SWC
- ✅ ESLint + Prettier
- ✅ PWA plugin configured
- ✅ Vitest (unit tests) + Playwright (E2E)

### Code Structure
- ✅ Modular folder structure (`src/features/*`)
- ✅ IndexedDB wrapper with versioned migrations
- ✅ Full TypeScript type system
- ✅ Utilities (logger, config, helpers)
- ✅ Service Worker (via Vite PWA plugin)

### CI/CD
- ✅ GitHub Actions workflow (lint, test, build, e2e)

### Documentation
- ✅ README.md - General documentation
- ✅ CLAUDE.md - Guide to Claude Code
- ✅ TECHNICAL-SPECS.md - Detailed technical specifications

## 🚀 Next Step: Development

### 1. Create a .env file

```bash
cp .env.example .env
```

Edit `.env` according to your environment (Mock APIs enabled by default).

### 2. Generate PWA icons

Place PNG icons in `public/icons/` with the sizes specified in `public/icons/README.md`.

You can generate them with:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 3. Run in development

```bash
npm run dev
```

The app will be located at `http://localhost:5173`

### 4. Verify that everything works

```bash
# Type check
npm run type-check

# Unit tests
npm run test

# E2E tests (requires running app)
npm run test:e2e
```

## 📝 Implement Features (M1 - Week 1)

According to `docs/plan-and-wbs.md`, the M1 deliverables are:

### High Priority (Must-Have):

1. **US-A1: Login** (`src/features/auth/`)
- Implement login screen
- Credential validation
- Session persistence in IndexedDB
- Offline mode if already logged in

2. **US-B1: Initial Sync** (`src/features/sync/`)
- Sync progress screen
- Download: route plan, clients, recommendations
- Save to IndexedDB
- Error handling and retries

3. **US-C1: Daily List** (`src/features/daily-list/`)
- List clients from IndexedDB
- Show "reason" for visit
- Basic filters
- Offline status banner

4. **Basic Observability** (`src/utils/logger.ts`)
- Structured logs (already implemented)
- Sync metrics (add)
- Health check endpoint (backend)

### Order Suggested:

```
1. Implement US-A1 (Login)
2. Implement US-B1 (Sync)
3. Implement US-C1 (List)
4. E2E tests of the Login flow → Sync → List
5. Telemetry and observability
```

## 🧪 Testing

### Unit Tests

```bash
npm run test # Run once
npm run test:watch # Watch mode
npm run test:coverage # With coverage report
```

Location: `src/**/__tests__/*.test.ts`

### E2E Tests

```bash
npm run test:e2e # Headless
npm run test:e2e:headed # With UI
npm run test:e2e:debug # Debug mode
npm run test:e2e:ui # Playwright UI
```

Location: `e2e/*.spec.ts`

## 📦 Build

```bash
npm run build # Production build
npm run preview # Build preview
npm run build:analyze # Bundle analysis
```

## 🔧 Development Tools

### VSCode (Recommended)

The project includes VSCode configuration (`.vscode/`):
- Format on save (Prettier)
- ESLint auto-fix
- Recommended extensions

### Feature Flags (Development)

You can override flags in localStorage:

```javascript
localStorage.setItem('flag:ff_inteligencia_competencia', 'true');
localStorage.setItem('flag:ff_apis_mock', 'false');
```

## 📚 Resources

- **Backlog**: `docs/backlog.csv`
- **Plan**: `docs/plan-and-wbs.md`
- **Runbook**: `docs/checklist-runbook.md`
- **Technical Specs**: `TECHNICAL-SPECS.md`

## ⚠️ Checklist before starting

- [ ] Installed dependencies (`npm install` executed)
- [ ] `.env` file created
- [ ] Type check passes (`npm run type-check`)
- [ ] Tests pass (`npm run test`)
- [ ] App runs on dev (`npm run dev`)
- [ ] Revised backlog (`docs/backlog.csv`)
- [ ] Revised M1 plan (`docs/plan-and-wbs.md`)

## 🎯 M1 Goal (Week 1 End)

**Walking skeleton in production**:
- ✅ PWA installable with active software
- ⏳ Functional login (mock or real)
- ⏳ Initial sync download of datasets
- ⏳ List of the day visible
- ⏳ CI/CD deploying to staging
- ⏳ Basic observability active

---

**Ready to develop!** 🚀

Start with `npm run dev` and begin implementing US-A1 (Login).