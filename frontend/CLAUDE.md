# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**webpv** is an offline-first Progressive Web App (PWA) for field sales representatives to manage daily client visits, capture feedback, and track market intelligence. The app must work completely offline during field operations and sync when connectivity is available.

**Timeline**: 4-week rapid delivery with strict milestones (M1-M4). See `docs/plan-and-wbs.md` for detailed schedule.

## Tech Stack

- **Frontend**: React + Vite
- **Offline Storage**: IndexedDB
- **Offline Support**: Service Worker with precache + runtime strategies
- **State Management**: TBD (likely Context API or Zustand)
- **Testing**: Vitest (unit/component), Playwright (E2E)
- **Styling**: TBD

## Development Commands

```bash
# Setup (when package.json exists)
npm install

# Development
npm run dev

# Testing
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:e2e:offline  # E2E with offline scenarios

# Build & Quality
npm run build
npm run lint
npm run type-check

# PWA specific
npm run build:analyze     # Bundle analysis
```

## Project Structure (Planned)

```
src/
├── components/          # Reusable UI components
├── features/           # Feature modules (auth, sync, feedback, etc.)
├── services/           # API, IndexedDB, Service Worker logic
├── stores/             # State management
├── utils/              # Helpers, constants
└── main.tsx

docs/
├── plan-and-wbs.md          # Project plan and milestones
├── checklist-runbook.md     # Release checklist and operations runbook
└── backlog.csv              # User stories (Epics EP-A through EP-Y)

TECHNICAL-SPECS.md      # Detailed architecture and implementation specs
```

## Key Architecture Principles

1. **Offline-first**: All critical flows must work without network
2. **Queue-based sync**: Operations queue locally with exponential backoff and idempotency keys
3. **Feature flags**: Progressive rollout using flags (e.g., `ff_inteligencia_competencia`, `ff_geo_validacion`)
4. **Performance budget**: LCP ≤ 2.5s on mid-range Android, bundle ≤ 300KB gzip

## Coding Conventions

### Language Standards

- **Code, comments, documentation**: Written in English (variables, functions, types, comments, technical docs)
- **User-facing text**: Written in Spanish (UI labels, buttons, messages, placeholders, error messages)
- **Example**:
  ```typescript
  // ✓ Correct
  function validateCredentials(username: string) {
    if (!username) {
      return { error: 'El nombre de usuario es requerido' }; // Spanish for user
    }
  }

  // ✗ Incorrect
  function validarCredenciales(nombreUsuario: string) { // Don't use Spanish for code
    if (!nombreUsuario) {
      return { error: 'Username is required' }; // Don't use English for user messages
    }
  }
  ```

### Technical Conventions

- **Feature flags**: Check flag state before rendering/enabling features
- **Offline queue**: All POST operations must include `idempotencyKey` and queue if offline
- **IndexedDB naming**: Use PascalCase for stores (e.g., `PlanDeRuta`, `FeedbackPendiente`)
- **Service Worker**: Increment `CACHE_VERSION` on every release
- **Error handling**: Log structured errors for observability

## Testing Requirements

- **Unit tests**: Required for all services, stores, and complex components
- **E2E tests**: Must include offline scenarios (network interruption during sync)
- **Accessibility**: No critical issues in axe-core checks
- **Performance**: Must pass bundle size and LCP budgets in CI

## Essential Documentation

- **User Stories**: See `docs/backlog.csv` (Epics EP-A through EP-Y)
- **Technical Specs**: See `TECHNICAL-SPECS.md` for architecture, API contracts, IndexedDB schemas
- **Operations**: See `docs/checklist-runbook.md` for deployment and incident playbooks
- **Project Plan**: See `docs/plan-and-wbs.md` for milestones and dependencies

## Critical Flows (Must-Have)

1. Login with persistent session
2. Initial sync with progress tracking
3. Daily client list with visit reasons
4. Client detail with recommendations
5. Feedback capture (online + offline)
6. Market intelligence (stockouts, inventory)
7. Finalize visit with geo validation
8. Final sync with queue draining

## Feature Flags

- `ff_inteligencia_competencia`: Enable/disable competitor intelligence
- `ff_geo_validacion`: Enable/adjust geolocation validation
- `ff_apis_mock`: Switch between mock and real backend

## Known Constraints

- **Service Worker caching**: Emergency SW ready to clear caches if versioning fails
- **Offline scope**: Limited to daily datasets only; no historical data offline
- **Conflict resolution**: "Last write wins" + server-side idempotency
- **Scope flexibility**: Competitor intelligence (EP-G) is "Should have" and can be deferred

## Where to Start

1. Read `README.md` for setup instructions
2. Review `docs/backlog.csv` to understand user stories
3. Check `TECHNICAL-SPECS.md` when implementing specific features
4. Follow milestone plan in `docs/plan-and-wbs.md`
