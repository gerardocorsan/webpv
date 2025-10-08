# WebPV Master Plan

**Project**: webpv - Offline-first PWA for Field Sales Representatives
**Timeline**: 4 weeks (M1-M4)
**Last Updated**: 2025-09-30
**Current Phase**: M1 - Week 1 - Component Specification Complete ✅

---

## Project Overview

**webpv** is an offline-first Progressive Web App (PWA) for field sales representatives to manage daily client visits, capture feedback, and track market intelligence. The app must work completely offline during field operations and sync when connectivity is available.

**Tech Stack**:
- React 18 + TypeScript
- Vite (build tool)
- Service Worker (offline support)
- IndexedDB (local storage)
- Zustand (state management)
- Vitest (unit tests) + Playwright (E2E tests)

**Key Principles**:
- **Offline-first**: All critical flows work without network
- **Queue-based sync**: Operations queue locally with exponential backoff
- **Contract-first development**: Specs → Approval → Implementation → Verification
- **Bilingual**: Code/docs in English, UI text in Spanish

---

## Milestones Overview

| Milestone | Duration | Key Deliverables | Status |
|-----------|----------|------------------|--------|
| **M1** | Week 1 | Login, Initial Sync, Project Scaffold | 🟡 In Progress |
| **M2** | Week 2 | Visit Flow, Feedback Capture, Offline Queue | ⚪ Not Started |
| **M3** | Week 3 | Market Intelligence, Geo Validation | ⚪ Not Started |
| **M4** | Week 4 | Final Sync, Testing, Deployment | ⚪ Not Started |

---

## M1: Foundation (Week 1) - CURRENT PHASE

**Goal**: Establish project foundation, implement login and initial sync flows

**Duration**: 5 working days (Day 1-5)

### M1 Progress Summary

**Overall M1 Status**: 🟡 40% Complete

| Work Package | Status | Progress | Notes |
|--------------|--------|----------|-------|
| **WP1.1: Project Setup** | ✅ Complete | 100% | Scaffold, configs, folder structure |
| **WP1.2: Component Specs** | ✅ Complete | 100% | 6 specs created |
| **WP1.3: Component Implementation** | ⚪ Not Started | 0% | Ready to begin |
| **WP1.4: Login Flow (US-A1)** | ⚪ Not Started | 0% | Depends on WP1.3 |
| **WP1.5: Initial Sync (US-B1)** | ⚪ Not Started | 0% | Depends on WP1.4 |

---

### WP1.1: Project Setup ✅ COMPLETE

**Status**: ✅ Complete (Day 1)
**Deliverables**:
- [x] Project scaffold created (React + Vite + PWA)
- [x] TypeScript, ESLint, Prettier configured
- [x] Testing setup (Vitest, Playwright)
- [x] CI/CD workflow (GitHub Actions)
- [x] Folder structure created
- [x] IndexedDB wrapper implemented
- [x] Service Worker setup
- [x] Utility functions (logger, config, helpers)
- [x] All tests passing (11/11)

**Key Files Created**:
- `package.json` (all dependencies)
- `tsconfig.json`, `vite.config.ts`, `eslint.config.js`
- `src/services/db/` (IndexedDB wrapper)
- `src/utils/` (logger, config, helpers)
- `src/types/index.ts` (TypeScript interfaces)
- `.github/workflows/ci.yml` (CI/CD pipeline)

**Documentation**:
- `CLAUDE.md` (AI guidance)
- `README.md` (developer docs)
- `TECHNICAL-SPECS.md` (architecture)
- `GETTING-STARTED.md` (quick start)

---

### WP1.2: Component Specifications ✅ COMPLETE

**Status**: ✅ Complete (Day 2)
**Strategy**: Contract-first development - detailed specs before implementation

**Deliverables**:
- [x] Design tokens specification
- [x] Icon component specification
- [x] Button component specification
- [x] Input component specification
- [x] Alert component specification
- [x] FormField component specification
- [x] Component implementation plan

**Specifications Created**:

1. **`design-tokens-spec.md`** (Foundation)
   - Color tokens (primary, semantic, neutral, text, background, border)
   - Typography tokens (fontFamily, fontSize, fontWeight, lineHeight)
   - Spacing tokens (4px base unit, 0-12 scale)
   - Border radius, shadows, animation tokens

2. **`icon-spec.md`** (Atom)
   - Material Icons + custom SVG support
   - Sizes: sm (16px), md (24px), lg (32px), xl (48px)
   - Colors: primary, error, success, warning, info, inherit, custom
   - Accessibility: aria-label, aria-hidden
   - Usage: Icons in buttons, inputs, alerts

3. **`button-spec.md`** (Atom)
   - Variants: primary (green), secondary (outlined)
   - States: normal, hover, pressed, disabled, loading
   - Size: 48px height (Android minimum touch target)
   - Loading spinner with Icon component
   - Accessibility: ARIA attributes, keyboard support

4. **`input-spec.md`** (Atom)
   - Types: text, password, email, search
   - Password toggle with visibility icons
   - Error, disabled, focused states
   - Font size: 16px minimum (prevents iOS zoom)
   - Accessibility: full ARIA support

5. **`alert-spec.md`** (Molecule)
   - Variants: error, success, warning, info
   - Dismissible option
   - Default icons per variant
   - role="alert" for screen readers

6. **`form-field-spec.md`** (Molecule)
   - Combines: Label + Input + Helper/Error text
   - Required field indicator (asterisk)
   - Error state replaces helper text
   - ARIA connections (aria-describedby, aria-invalid)

7. **`component-plan.md`** (Implementation Guide)
   - Component dependency tree
   - Implementation order and timeline
   - Complete acceptance checklist (40+ criteria)
   - Testing strategy
   - Quality gates

**Key Decision**: Specs before implementation
- **Rationale**: Prevent context loss during long development sessions
- **Benefit**: Clear checkpoints, easy recovery, no over-engineering
- **Result**: 6 comprehensive specs ready for implementation

---

### WP1.3: Component Implementation ⚪ NOT STARTED

**Status**: ⚪ Not Started (Next up - Day 3-4)
**Duration**: 2-3 days (10-15 hours)
**Dependencies**: WP1.2 complete ✅

**Implementation Order**:

**Phase 0: Foundation** (2-3 hours)
1. Design Tokens (`src/styles/tokens.ts`)
   - Export all color, typography, spacing tokens
   - TypeScript types
   - Unit tests

**Phase 1: Atoms** (6-8 hours)
2. Icon Component (`src/components/atoms/Icon.tsx`)
   - Material Icons + custom SVG
   - 8+ unit tests

3. Button Component (`src/components/atoms/Button.tsx`)
   - Primary/secondary variants
   - Loading state with spinner
   - 7+ unit tests

4. Input Component (`src/components/atoms/Input.tsx`)
   - Text/password/email/search types
   - Password toggle
   - 7+ unit tests

**Phase 2: Molecules** (3-4 hours)
5. Alert Component (`src/components/molecules/Alert.tsx`)
   - 4 variants (error, success, warning, info)
   - Dismissible option
   - 6+ unit tests

6. FormField Component (`src/components/molecules/FormField.tsx`)
   - Label + Input + Helper/Error
   - ARIA connections
   - 6+ unit tests

**Quality Gates**:
- [ ] All unit tests pass (40+ tests)
- [ ] TypeScript compiles with no errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] All acceptance criteria checked
- [ ] Components use design tokens (no hardcoded values)
- [ ] Accessibility requirements met
- [ ] Visual review complete

**Acceptance Criteria**: See `docs/specs/components/component-plan.md` for complete checklist

---

### WP1.4: Login Flow (US-A1) ⚪ NOT STARTED

**Status**: ⚪ Not Started (Day 4-5)
**Duration**: 1-1.5 days
**Dependencies**: WP1.3 complete

**User Story**: US-A1 - Login with persistent session
```
As an advisor
I want to log in with my ID and password
So that I can access my daily visit plan
```

**Deliverables**:
- [ ] Login screen UI (`src/features/auth/LoginScreen.tsx`)
- [ ] Authentication service (`src/services/auth.ts`)
- [ ] Session persistence (IndexedDB)
- [ ] Login validation (client-side)
- [ ] Error handling (invalid credentials)
- [ ] Offline detection
- [ ] Unit tests (auth service)
- [ ] E2E tests (`e2e/login.spec.ts`)

**Components Used**:
- FormField (ID and password inputs)
- Button ("Entrar" action)
- Alert (error messages)
- OfflineBanner (connection status)

**Acceptance Criteria**:
- [ ] Login form renders with ID and password fields
- [ ] "Entrar" button disabled until both fields filled
- [ ] Button shows loading state during authentication
- [ ] Success: Navigate to /sync screen
- [ ] Error: Show error alert "Credenciales inválidas"
- [ ] Session persists (refresh doesn't log out)
- [ ] Works offline (cached credentials validation)

**API Integration**: `/api/login` endpoint (see TECHNICAL-SPECS.md)

---

### WP1.5: Initial Sync (US-B1) ⚪ NOT STARTED

**Status**: ⚪ Not Started (Day 5)
**Duration**: 0.5-1 day
**Dependencies**: WP1.4 complete

**User Story**: US-B1 - Initial sync with progress tracking
```
As an advisor
I want to sync my daily plan and client data
So that I can work offline during field visits
```

**Deliverables**:
- [ ] Sync screen UI (`src/features/sync/SyncScreen.tsx`)
- [ ] Sync service (`src/services/sync.ts`)
- [ ] Progress tracking (IndexedDB)
- [ ] Download: Visit plan, clients, products, recommendations
- [ ] Error handling (network failures)
- [ ] Unit tests (sync service)
- [ ] E2E tests (`e2e/sync.spec.ts`)

**Components Used**:
- Progress bar (new component - simple molecule)
- Alert (success/error messages)
- Button ("Continuar" after sync)

**Acceptance Criteria**:
- [ ] Sync starts automatically after login
- [ ] Progress bar shows % complete (0-100%)
- [ ] Downloads: Plan, clients, products, recommendations
- [ ] Data saved to IndexedDB (4 stores)
- [ ] Success: Show success alert, enable "Continuar" button
- [ ] Error: Show error alert with "Reintentar" button
- [ ] Offline: Detect and show appropriate message

**API Integration**: `/api/sync/initial` endpoint (see TECHNICAL-SPECS.md)

---

### M1 Completion Criteria

**M1 is complete when**:
- [x] Project scaffold created
- [x] Component specifications written
- [ ] 6 UI components implemented and tested
- [ ] Login flow (US-A1) implemented
- [ ] Initial sync (US-B1) implemented
- [ ] All unit tests passing
- [ ] E2E tests for login and sync passing
- [ ] Build succeeds
- [ ] No critical bugs

**M1 Demo**: Show login → sync → success flow to stakeholders

---

## M2: Visit Flow (Week 2) - PLANNED

**Goal**: Implement client visit flows and feedback capture

**Duration**: 5 working days (Day 6-10)

### Key Deliverables

**US-C1: Daily Client List**
- Client list view with visit reasons
- Search and filter functionality
- Visit status indicators

**US-D1: Client Detail View**
- Client information display
- Active recommendations
- Past visit history

**US-E1: Feedback Capture**
- Feedback form (online + offline)
- Photo capture (optional)
- Offline queue integration

**US-F1: Inventory Capture**
- Inventory form
- SKU search
- Quantity input

**US-H1: Visit Finalization**
- Finalize visit with geo validation
- Notes capture
- Mark visit complete

**Additional Components Needed**:
- Card (molecule)
- List (organism)
- SearchBar (molecule)
- Chip (atom)
- Badge (atom)
- PhotoCapture (molecule)
- QuantityInput (molecule)

**Milestone Criteria**:
- [ ] Can view daily client list
- [ ] Can open client detail
- [ ] Can capture feedback offline
- [ ] Can capture inventory offline
- [ ] Can finalize visit with geolocation
- [ ] All data queued in IndexedDB
- [ ] All M2 E2E tests passing

---

## M3: Market Intelligence (Week 3) - PLANNED

**Goal**: Implement market intelligence features and offline sync

**Duration**: 5 working days (Day 11-15)

### Key Deliverables

**US-G1: Competitor Intelligence** (Should have - can defer)
- Competitor product capture
- Competitor pricing
- Offline queue

**US-I1: Stockout Reporting**
- Stockout capture
- SKU selection
- Offline queue

**US-L1: Final Sync**
- Upload all pending data
- Queue processing with retry logic
- Conflict resolution
- Progress tracking

**US-K1: Sync Status**
- View pending items count
- Manual sync trigger
- Sync error handling

**Additional Components Needed**:
- SelectField (molecule)
- Checkbox (atom)
- RadioButton (atom)
- Modal (organism)
- Toast (molecule)

**Milestone Criteria**:
- [ ] Can capture competitor intelligence
- [ ] Can report stockouts
- [ ] Can trigger manual sync
- [ ] Pending items count visible
- [ ] Final sync uploads all queued data
- [ ] Exponential backoff retry works
- [ ] Idempotency keys prevent duplicates
- [ ] All M3 E2E tests passing

---

## M4: Polish & Deployment (Week 4) - PLANNED

**Goal**: Testing, performance optimization, deployment

**Duration**: 5 working days (Day 16-20)

### Key Deliverables

**Testing & QA**:
- [ ] Full E2E test suite (all user stories)
- [ ] Offline scenario tests
- [ ] Performance testing (LCP ≤ 2.5s)
- [ ] Bundle size validation (≤ 300KB gzip)
- [ ] Accessibility audit (axe-core, no critical issues)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile device testing (Android, iOS)

**Performance Optimization**:
- [ ] Code splitting
- [ ] Lazy loading routes
- [ ] Image optimization
- [ ] Service Worker optimization
- [ ] IndexedDB query optimization

**Deployment**:
- [ ] Production build
- [ ] Environment configuration
- [ ] Service Worker cache versioning
- [ ] Deploy to staging
- [ ] User acceptance testing (UAT)
- [ ] Deploy to production
- [ ] Monitoring setup

**Documentation**:
- [ ] API documentation
- [ ] Deployment runbook
- [ ] User guide (Spanish)
- [ ] Troubleshooting guide

**Milestone Criteria**:
- [ ] All E2E tests passing (100% coverage of user stories)
- [ ] Performance budget met (LCP, bundle size)
- [ ] No accessibility issues
- [ ] Deployed to production
- [ ] Monitoring active
- [ ] Stakeholder approval

---

## Current Status: Detailed Breakdown

### ✅ Completed

**Project Foundation**:
- React + Vite + TypeScript scaffold
- ESLint, Prettier, Vitest, Playwright setup
- CI/CD pipeline (GitHub Actions)
- IndexedDB wrapper with migrations
- Service Worker basic setup
- Utility functions (logger, config, helpers)
- Type definitions (User, Cliente, QueueItem, etc.)

**Documentation**:
- CLAUDE.md (AI guidance with language conventions)
- README.md (developer documentation)
- TECHNICAL-SPECS.md (architecture, APIs, schemas)
- GETTING-STARTED.md (quick start guide)
- docs/recommendations-m1.md (component analysis)

**Component Specifications (Contract-First Development)**:
- Design tokens spec (colors, typography, spacing)
- Icon component spec (atoms)
- Button component spec (atoms)
- Input component spec (atoms)
- Alert component spec (molecules)
- FormField component spec (molecules)
- Component implementation plan

### 🟡 In Progress

**Next Immediate Step**: Component Implementation (WP1.3)
- **Phase 0**: Implement design tokens (`src/styles/tokens.ts`)
- **Phase 1**: Implement atoms (Icon, Button, Input)
- **Phase 2**: Implement molecules (Alert, FormField)
- **Duration**: 2-3 days (10-15 hours)
- **Checkpoint**: Review specs before starting implementation

### ⚪ Not Started

**M1 Remaining**:
- Component implementation (Day 3-4)
- Login flow (Day 4-5)
- Initial sync (Day 5)

**M2-M4**:
- Visit flow components (Week 2)
- Market intelligence features (Week 3)
- Testing, optimization, deployment (Week 4)

---

## Key Decisions Log

### Decision 1: Contract-First Development ✅

**Date**: 2025-09-30
**Context**: User noted tendency to lose focus during long development sessions
**Decision**: Create detailed specifications before implementation
**Rationale**:
- Provides clear checkpoints and recovery points
- Prevents over-engineering
- Enables parallel development
- Easier code review and approval
**Result**: 6 comprehensive component specs created (500-700 lines each)

---

### Decision 2: Language Convention ✅

**Date**: 2025-09-30
**Context**: Bilingual team, Spanish-speaking end users
**Decision**: Code/comments/docs in English, UI text in Spanish
**Rationale**:
- English: Universal language for programming, better library/docs compatibility
- Spanish: Better UX for end users (field sales reps in Latin America)
- Separation of concerns: Technical vs user-facing content
**Implementation**:
- `src/utils/constants.ts` with `UI_TEXT` object (all Spanish)
- Examples in CLAUDE.md and README.md
- Clear guidelines for contributors

---

### Decision 3: Component Subset for M1 ✅

**Date**: 2025-09-30
**Context**: 10 atoms + 9 molecules identified from prototypes
**Decision**: Implement only 5 critical components for M1
**Rationale**:
- Focus on login and sync flows only
- Just-in-time creation for other components
- Avoid over-engineering and context loss
- 2-3 day timeline vs 1-2 weeks for all components
**Selected Components**: Icon, Button, Input, Alert, FormField

---

## Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Service Worker caching issues | High | Medium | Emergency SW ready to clear caches |
| IndexedDB quota exceeded | High | Low | Limit to daily datasets only |
| Offline sync conflicts | Medium | Medium | Last write wins + server idempotency |
| Performance budget exceeded | Medium | Low | Code splitting, lazy loading, monitoring |
| Scope creep (EP-G competitor intelligence) | Low | Medium | Marked as "Should have", can defer to M2/M3 |

---

## Success Metrics

### M1 Success Metrics
- [ ] Login success rate: 100% (no authentication failures)
- [ ] Initial sync success rate: 100% (all data downloaded)
- [ ] Initial sync time: ≤10 seconds (on good connection)
- [ ] Unit test coverage: ≥80%
- [ ] E2E tests passing: 100% (login, sync)
- [ ] Build time: ≤30 seconds
- [ ] Bundle size: ≤200KB gzip (M1 only, will grow)

### Overall Project Success Metrics
- [ ] Offline-first: 100% of critical flows work offline
- [ ] LCP (Largest Contentful Paint): ≤2.5 seconds
- [ ] Bundle size: ≤300KB gzip (full app)
- [ ] Test coverage: ≥80% (statements, branches, functions, lines)
- [ ] Accessibility: No critical axe-core issues
- [ ] User satisfaction: ≥4.5/5 (UAT feedback)

---

## Next Steps (Immediate)

### Today/Tomorrow:
1. **Review and approve component specs** (30 minutes)
   - Read all specs in `docs/specs/components/`
   - Verify alignment with Technical Implementation Guide
   - Confirm acceptance criteria are clear

2. **Implement design tokens** (2-3 hours)
   - Create `src/styles/tokens.ts`
   - Export all color, typography, spacing tokens
   - Write unit tests
   - Run tests and type-check

3. **Implement Icon component** (1-2 hours)
   - Create `src/components/atoms/Icon.tsx`
   - Support Material Icons and custom SVG
   - Write 8+ unit tests
   - Run tests and type-check

4. **Implement Button component** (2-3 hours)
   - Create `src/components/atoms/Button.tsx`
   - Primary/secondary variants
   - Loading state with spinner
   - Write 7+ unit tests

5. **Implement Input component** (2-3 hours)
   - Create `src/components/atoms/Input.tsx`
   - Text/password/email/search types
   - Password toggle
   - Write 7+ unit tests

6. **Implement Alert component** (1.5-2 hours)
   - Create `src/components/molecules/Alert.tsx`
   - 4 variants (error, success, warning, info)
   - Write 6+ unit tests

7. **Implement FormField component** (1.5-2 hours)
   - Create `src/components/molecules/FormField.tsx`
   - Label + Input + Helper/Error
   - ARIA connections
   - Write 6+ unit tests

8. **Visual review** (30 minutes)
   - Check components in browser
   - Verify colors, spacing, typography from tokens
   - Test keyboard navigation
   - Test screen reader announcements

### This Week:
- [ ] Complete component implementation (Day 3-4)
- [ ] Implement login flow (Day 4-5)
- [ ] Implement initial sync (Day 5)
- [ ] **M1 Demo** (End of Week 1)

### Next Week:
- [ ] Start M2: Visit flow implementation
- [ ] Implement client list, detail views
- [ ] Implement feedback and inventory capture
- [ ] Implement visit finalization with geo validation

---

## References

**Project Documentation**:
- `CLAUDE.md` - AI guidance and conventions
- `README.md` - Developer documentation
- `TECHNICAL-SPECS.md` - Architecture and APIs
- `GETTING-STARTED.md` - Quick start guide
- `docs/plan-and-wbs.md` - Detailed project plan
- `docs/backlog.csv` - User stories (EP-A through EP-Y)
- `docs/checklist-runbook.md` - Release checklist and runbook

**Component Specifications**:
- `docs/specs/components/design-tokens-spec.md`
- `docs/specs/components/icon-spec.md`
- `docs/specs/components/button-spec.md`
- `docs/specs/components/input-spec.md`
- `docs/specs/components/alert-spec.md`
- `docs/specs/components/form-field-spec.md`
- `docs/specs/components/component-plan.md`

**Component Analysis**:
- `docs/recommendations-m1.md` - Complete component inventory

---

## Changelog

**2025-09-30 - M1 Day 2**:
- ✅ Created 6 component specifications
- ✅ Created component implementation plan
- ✅ Created master plan document
- 🎯 Ready to begin component implementation

**2025-09-29 - M1 Day 1**:
- ✅ Created project scaffold
- ✅ Set up configurations (TS, ESLint, Prettier, Vitest, Playwright)
- ✅ Implemented IndexedDB wrapper
- ✅ Created utility functions
- ✅ All tests passing (11/11)

---

**Status**: 📋 Specification phase complete. Ready to implement components.

**Next Checkpoint**: Component implementation complete (Day 4)
