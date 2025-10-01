#webpv - Point of Sale Intelligence PWA

Offline-first progressive web app for field advisors who conduct customer visits, capture sales feedback, and gather market intelligence.

## 🎯 Key Features

- **100% Offline Operation**: All critical workflows work offline
- **Smart Sync**: Retry queue with exponential backoff and idempotence
- **Installable PWA**: Native experience on Android/iOS devices
- **Geolocation**: Location validation at the end of visits
- **Market Intelligence**: Capture stockouts and inventory (your own and competitors)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd webpv

# Install dependencies
npm install

# Start in development mode
npm run dev
```

The app will be available on `http://localhost:5173`

## 📋 Available Scripts

```bash
npm run dev # Development server with HMR
npm run build # Production build
npm run preview # Production build preview
npm run lint # Run linter
npm run test # Unit tests (vitest)
npm run test:e2e # E2E tests (Playwright)
npm run test:e2e:offline # E2E tests with offline scenarios
npm run type-check # TypeScript type checking
```

## 📁 Project Structure

```
webpv/
├── docs/ # Project documentation
│ ├── plan-and-wbs.md # 4-week plan and WBS
│ ├── checklist-runbook.md # Release and runbook checklist
│ └── backlog.csv # User stories (Epics EP-A to EP-Y)
├── src/
│ ├── components/ # Reusable UI components
│ ├── features/ # Modules per feature
│ │ ├── auth/ # Authentication and session
│ │ ├── sync/ # Initial and final synchronization
│ │ ├── daily-list/ # List of the day
│ │ ├── client-detail/ # Client details
│ │ ├── feedback/ # Capture feedback
│ │ ├── intelligence/ # Market intelligence
│ │ └── visit-closure/ # Visit closure
│ ├── services/ # Business logic
│ │ ├── api/ # API Clients
│ │ ├── db/ # IndexedDB
│ │ └── sw/ # Service Worker
│ ├── stores/ # State management
│ ├── utils/ # Utilities and constants
│ └── main.tsx # Entry point
├── public/
│ ├── manifest.json # PWA manifest
│ └── service-worker.js # Service Worker
├── CLAUDE.md # Guide for Claude Code
├── TECHNICAL-SPECS.md # Detailed technical specifications
└── README.md # This file
```

## 🔑 Main Flows

1. **Authentication**: Login with credentials, persistent session, offline mode
2. **Preparation**: Initial synchronization of daily datasets (route plan, clients, recommendations)
3. **Daily List**: Display of clients to visit with reason for visit and priority
4. **Client Details**: Client information and prioritized recommendations
5. **Feedback Log**: Capture visit results (accepted/rejected) with reasons and notes
6. **Market Intelligence**:
- Stockouts by SKU
- Private label inventory
- Competitor inventory (feature flag)
7. **Visit closure**: End with geo-validation and summary
8. **Final synchronization**: Empty offline queue and report shipments

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MOCKS=false
VITE_FEATURE_FLAG_COMPETENCIA=false
VITE_FEATURE_FLAG_GEO_VALIDATION=true
```

### Feature Flags

- `ff_inteligencia_competencia`: Enables competitor inventory capture
- `ff_geo_validacion`: Enables/adjusts geolocation validation
- `ff_apis_mock`: Toggle between mock and real APIs

## 🧪 Testing

### Unit Tests

```bash
npm run test
npm run test:watch # Watch mode
npm run test:coverage # With coverage
```

### E2E Tests

```bash
npm run test:e2e
npm run test:e2e:headed # With UI
npm run test:e2e:debug # Debug mode
```

### Offline Tests

E2E tests include critical offline scenarios:
- Sync interrupted due to network loss
- Capturing feedback offline
- Queue flushing upon reconnection

## 📦 Build and Deployment

```bash
# Production Build
npm run build

# Local build preview
npm run preview

# Bundle analysis
npm run build:analyze
```

### Release Checklist

See `docs/checklist-runbook.md` for the complete checklist before deploying to production.

## 🏗️ Architecture

See `TECHNICAL-SPECS.md` for detailed documentation on:
- General system architecture
- IndexedDB schemas
- Service Worker strategies
- API contracts
- Offline queue handling
- Security and Performance

## 📚 Additional Documentation

- **Project Plan**: `docs/plan-and-wbs.md` - Milestones M1-M4, WBS, and dependencies
- **User Stories**: `docs/backlog.csv` - Stories organized by epics
- **Operations**: `docs/checklist-runbook.md` - Incident runbooks and playbooks
- **Claude's Guide**: `CLAUDE.md` - Information for IA code assistants

## 🎯 Project Milestones

- **M1 (Week 1)**: Walking skeleton - PWA shell + initial sync + basic observability
- **M2 (Week 2)**: First E2E slice - Detail → Feedback → Closure (online + offline)
- **M3 (Week 3)**: Market intelligence + hardening (performance, a11y)
- **M4 (Week 4)**: UAT + Go-live + Hypercare

## 🤝 Contribution

1. Create branch from `main`: `feature/US-X-description`
2. Implement changes following offline-first principles
3. Add unit and E2E tests as appropriate
4. Verify accessibility (axe-core without critical errors)
5. Ensure performance budget is passed (LCP ≤ 2.5s, bundle ≤ 300KB)
6. Create PR with clear description and link to user story

### Definition of Done

- [ ] Unit and E2E tests passing
- [ ] No critical accessibility errors
- [ ] Performance budgets met
- [ ] Telemetry added for key events
- [ ] Offline states handled
- [ ] Code review approved

## 📄 License

[Specify [license]

## 👥 Team

[Team Contact Information]