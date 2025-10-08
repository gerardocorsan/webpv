# Features

This directory contains feature modules, each implementing specific user stories from the backlog.

## Feature Modules

### auth/
**Epic:** EP-A Autenticación y sesión
**Stories:** US-A1, US-A2
- Login with credentials
- Session persistence
- Password recovery
- Offline read mode

### sync/
**Epics:** EP-B (Initial), EP-I (Final)
**Stories:** US-B1, US-I1
- Initial sync with progress tracking
- Final sync with queue draining
- Resume interrupted sync
- Sync status UI

### daily-list/
**Epic:** EP-C Lista del día
**Stories:** US-C1, US-C2
- Display client list with visit reasons
- Search and filter
- Quick actions
- Offline mode banner

### client-detail/
**Epic:** EP-D Detalle de cliente
**Stories:** US-D1
- Client information display
- Recommendations with priority
- Action CTAs
- Offline state handling

### feedback/
**Epic:** EP-E Feedback comercial
**Stories:** US-E1
- Capture visit feedback
- Offline queue management
- Result/reason/note form
- Sync status

### intelligence/
**Epics:** EP-F (Own brands), EP-G (Competitors)
**Stories:** US-F1, US-F2, US-G1
- Stockout capture (quiebre)
- Inventory registration (own)
- Competitor intelligence (feature flag)
- Offline queue

### visit-closure/
**Epic:** EP-H Cierre de visita
**Stories:** US-H1
- Visit finalization
- Geo validation
- Summary of completed tasks
- Notes and justifications

## Module Structure

Each feature module should follow this structure:

```
feature-name/
├── components/          # UI components
├── hooks/              # Custom hooks
├── services/           # Business logic
├── types/              # TypeScript types
├── utils/              # Utilities
├── index.ts            # Public API
└── README.md           # Feature documentation
```

## Implementation Guidelines

1. **Offline-first**: All features must work offline
2. **Queue operations**: POST operations must use offline queue
3. **Feature flags**: Check flags before rendering optional features
4. **Accessibility**: Follow WCAG 2.1 AA guidelines
5. **Testing**: Include unit tests and E2E scenarios
