# Component Implementation Plan - M1 Phase

**Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Ready for Implementation

## Overview

This document outlines the implementation plan for the 5 critical UI components needed for M1 (Login + Sync flows). All component specifications have been completed and are ready for implementation.

**Timeline**: 2-3 days for all components
**Milestone**: M1 - Week 1
**Dependencies**: Design tokens must be implemented first

---

## Component Specifications Completed

✅ **Design Tokens** - `design-tokens-spec.md`
✅ **Icon** (Atom) - `icon-spec.md`
✅ **Button** (Atom) - `button-spec.md`
✅ **Input** (Atom) - `input-spec.md`
✅ **Alert** (Molecule) - `alert-spec.md`
✅ **FormField** (Molecule) - `form-field-spec.md`

---

## Component Dependency Tree

```
Design Tokens (src/styles/tokens.ts)
    │
    ├─── Icon (Atom)
    │     │
    │     ├─── Button (Atom)
    │     │     └─── FormField (Molecule)
    │     │
    │     ├─── Input (Atom)
    │     │     └─── FormField (Molecule)
    │     │
    │     └─── Alert (Molecule)
    │
    └─── (All components depend on tokens)
```

**Dependency Explanation**:
- **Design Tokens**: Foundation for all components (colors, typography, spacing)
- **Icon**: Used by Button (loading spinner, startIcon, endIcon), Input (password toggle, search icon), Alert (status icons)
- **Button**: Standalone atom, also used in FormField for form actions
- **Input**: Standalone atom, composed into FormField molecule
- **FormField**: Molecule that combines Input + Label + Helper/Error text
- **Alert**: Standalone molecule for feedback messages

---

## Implementation Order

### Phase 0: Foundation (Day 1 - Morning)

**Duration**: 2-3 hours

1. **Design Tokens** - `src/styles/tokens.ts`
   - File: `src/styles/tokens.ts`
   - Export: `export const tokens = { colors, typography, spacing, ... }`
   - Type: `export type Tokens = typeof tokens;`
   - Validation: Import in a test file and verify all token paths exist

**Acceptance Criteria**:
- [ ] tokens.ts exports all color tokens (primary, semantic, neutral, text, background, border)
- [ ] tokens.ts exports all typography tokens (fontFamily, fontSize, fontWeight, lineHeight)
- [ ] tokens.ts exports all spacing tokens (0-12)
- [ ] tokens.ts exports borderRadius, shadows, animation tokens
- [ ] TypeScript type `Tokens` is exported
- [ ] No hardcoded values used (all values from spec)

**Testing**:
```typescript
import { tokens } from '@/styles/tokens';

describe('Design Tokens', () => {
  it('exports colors', () => {
    expect(tokens.colors.primary.main).toBe('#0A7D2B');
  });
  it('exports typography', () => {
    expect(tokens.typography.fontSize.base).toBe('16px');
  });
  it('exports spacing', () => {
    expect(tokens.spacing['4']).toBe('16px');
  });
});
```

---

### Phase 1: Atoms (Day 1 - Afternoon + Day 2 - Morning)

**Duration**: 6-8 hours

#### 1.1 Icon Component (1-2 hours)

**File**: `src/components/atoms/Icon.tsx`

**Acceptance Criteria**:
- [ ] Renders Material icon with name prop
- [ ] Renders custom SVG with children prop
- [ ] All size variants (sm, md, lg, xl) work correctly
- [ ] All color variants work correctly (primary, error, success, warning, info, inherit, custom)
- [ ] ariaLabel sets role="img" and aria-label
- [ ] ariaHidden hides from screen readers
- [ ] onClick handler is called when clicked
- [ ] Unit tests pass (8 tests minimum)

**Key Implementation Notes**:
- Include Material Icons font in index.html or via npm
- Use size and color maps from spec
- Support both Material Icons and custom SVG
- Default size: `md` (24×24px)
- Default color: `inherit`

---

#### 1.2 Button Component (2-3 hours)

**File**: `src/components/atoms/Button.tsx`

**Acceptance Criteria**:
- [ ] Primary and secondary variants render with correct styles
- [ ] All states work (normal, hover, pressed, disabled, loading)
- [ ] onClick handler is called (unless disabled or loading)
- [ ] Loading spinner appears when loading={true}
- [ ] Button is not clickable when disabled or loading
- [ ] Minimum touch target of 48×48px maintained
- [ ] Focus indicator visible and meets WCAG AA
- [ ] Keyboard navigation works (Enter, Space)
- [ ] Screen reader announces state correctly
- [ ] Small size variant (36px visual, 48px touch target)
- [ ] Full width variant takes 100% of container
- [ ] startIcon and endIcon display correctly
- [ ] Unit tests pass (7 tests minimum)

**Key Implementation Notes**:
- Loading spinner uses Icon component with rotation animation
- Disabled state prevents all interactions (not just pointer-events: none)
- Touch target compliance even for small variant (use padding)
- Loading state shows spinner + text, maintains button width (no layout shift)

---

#### 1.3 Input Component (2-3 hours)

**File**: `src/components/atoms/Input.tsx`

**Acceptance Criteria**:
- [ ] Text, password, email, search variants render correctly
- [ ] onChange called with new value when user types
- [ ] Password toggle shows/hides password correctly
- [ ] Error state displays with red border and aria-invalid
- [ ] Disabled state prevents interaction, shows gray background
- [ ] Focus state shows green border
- [ ] Icons (startIcon, endIcon) display correctly
- [ ] Placeholder text shows when empty
- [ ] MaxLength attribute limits input length
- [ ] Font size is minimum 16px (no iOS zoom)
- [ ] Keyboard navigation works (Tab, Shift+Tab)
- [ ] Screen reader announces field state correctly
- [ ] Unit tests pass (7 tests minimum)

**Key Implementation Notes**:
- Password toggle implementation with visibility/visibility_off icons
- Controlled component pattern (value + onChange required)
- onChange receives (value, event) as parameters
- fontSize: 16px minimum to prevent iOS auto-zoom
- Mobile keyboard optimization with inputMode prop

---

### Phase 2: Molecules (Day 2 - Afternoon)

**Duration**: 3-4 hours

#### 2.1 Alert Component (1.5-2 hours)

**File**: `src/components/molecules/Alert.tsx`

**Acceptance Criteria**:
- [ ] Four variants (error, success, warning, info) render with correct colors
- [ ] Icon shows by default with variant-specific icon
- [ ] Icon can be hidden with showIcon={false}
- [ ] Custom icon can be provided
- [ ] Dismiss button shows when dismissible={true}
- [ ] onDismiss callback is called when dismissed
- [ ] role="alert" is set for screen reader announcement
- [ ] Alert has proper contrast ratio (WCAG AA)
- [ ] Unit tests pass (6 tests minimum)

**Key Implementation Notes**:
- Uses Icon component for variant icons (error, check_circle, warning, info)
- role="alert" for immediate screen reader announcement
- aria-live="assertive" for error, aria-live="polite" for others
- Dismiss button has aria-label="Cerrar alerta"

---

#### 2.2 FormField Component (1.5-2 hours)

**File**: `src/components/molecules/FormField.tsx`

**Acceptance Criteria**:
- [ ] Label, input, and helper/error text render in correct layout
- [ ] Required asterisk (*) shows when required={true}
- [ ] Helper text displays when provided and no error
- [ ] Error message displays when error prop is provided
- [ ] Error message replaces helper text (not both shown)
- [ ] Label changes color when focused (green)
- [ ] Label changes color when error (red)
- [ ] Input is properly labeled (htmlFor/id connection)
- [ ] Error message has role="alert" for screen readers
- [ ] aria-describedby connects input to error/helper
- [ ] aria-required is set when required={true}
- [ ] aria-invalid is set when error exists
- [ ] Unit tests pass (6 tests minimum)

**Key Implementation Notes**:
- Composes Input component
- Automatically generates IDs for proper ARIA connections
- Gap: 4px between label, input, and helper/error
- Error message has role="alert" for immediate announcement
- Required indicator: asterisk with aria-label="requerido"

---

## Complete Acceptance Checklist

### Design Tokens (`src/styles/tokens.ts`)
- [ ] All color tokens exported
- [ ] All typography tokens exported
- [ ] All spacing tokens exported
- [ ] borderRadius, shadows, animation tokens exported
- [ ] TypeScript types exported
- [ ] Unit tests pass

### Icon Component (`src/components/atoms/Icon.tsx`)
- [ ] Material icons render
- [ ] Custom SVG renders
- [ ] All sizes work (sm, md, lg, xl)
- [ ] All colors work (primary, error, success, etc.)
- [ ] Accessibility attributes work (ariaLabel, ariaHidden)
- [ ] onClick works
- [ ] 8+ unit tests pass

### Button Component (`src/components/atoms/Button.tsx`)
- [ ] Primary/secondary variants render
- [ ] All states work (normal, hover, pressed, disabled, loading)
- [ ] onClick works (unless disabled/loading)
- [ ] Loading spinner shows
- [ ] Touch target compliance (48×48px)
- [ ] Keyboard navigation works
- [ ] Focus indicator visible
- [ ] Small size variant works
- [ ] Full width works
- [ ] Icons (startIcon, endIcon) work
- [ ] 7+ unit tests pass

### Input Component (`src/components/atoms/Input.tsx`)
- [ ] All type variants render (text, password, email, search)
- [ ] onChange works
- [ ] Password toggle works
- [ ] Error state works
- [ ] Disabled state works
- [ ] Focus state works
- [ ] Icons work (startIcon, endIcon)
- [ ] Placeholder shows
- [ ] MaxLength limits input
- [ ] Font size ≥16px
- [ ] Keyboard navigation works
- [ ] 7+ unit tests pass

### Alert Component (`src/components/molecules/Alert.tsx`)
- [ ] 4 variants render (error, success, warning, info)
- [ ] Default icon shows
- [ ] Icon can be hidden
- [ ] Custom icon works
- [ ] Dismiss button works
- [ ] onDismiss callback works
- [ ] role="alert" set
- [ ] WCAG AA contrast
- [ ] 6+ unit tests pass

### FormField Component (`src/components/molecules/FormField.tsx`)
- [ ] Label, input, helper/error render
- [ ] Required asterisk shows
- [ ] Helper text shows
- [ ] Error message shows
- [ ] Error replaces helper (not both)
- [ ] Label colors change (focus/error)
- [ ] htmlFor/id connection works
- [ ] Error has role="alert"
- [ ] aria-describedby works
- [ ] aria-required works
- [ ] aria-invalid works
- [ ] 6+ unit tests pass

---

## Testing Strategy

### Unit Tests (Vitest)

**Target**: 40+ tests across all components

**Coverage Requirements**:
- Statements: ≥80%
- Branches: ≥75%
- Functions: ≥80%
- Lines: ≥80%

**Test Files**:
```
src/styles/__tests__/tokens.test.ts
src/components/atoms/__tests__/Icon.test.tsx
src/components/atoms/__tests__/Button.test.tsx
src/components/atoms/__tests__/Input.test.tsx
src/components/molecules/__tests__/Alert.test.tsx
src/components/molecules/__tests__/FormField.test.tsx
```

**Run Tests**:
```bash
npm run test           # All tests
npm run test:coverage  # With coverage report
```

---

### Visual Regression Tests (Optional for M1)

**Tool**: Storybook + Chromatic (or Percy)

**Stories to Create**:
- Icon: All sizes and colors
- Button: All variants and states
- Input: All types and states
- Alert: All variants
- FormField: Normal, error, focused states

**Run Storybook**:
```bash
npm run storybook
```

---

### E2E Tests (Playwright)

**E2E tests for components are deferred to feature-level testing.**

Components will be tested as part of:
- US-A1 (Login) - Tests Button, Input, FormField, Alert
- US-B1 (Sync) - Tests Alert
- US-C1 (Client List) - Tests all components in real scenarios

---

## Implementation Workflow

### For Each Component:

1. **Read the spec** - Review component-spec.md thoroughly
2. **Create component file** - `src/components/atoms/ComponentName.tsx`
3. **Implement component** - Follow spec exactly (TypeScript interface, props, states)
4. **Create test file** - `src/components/atoms/__tests__/ComponentName.test.tsx`
5. **Write unit tests** - Cover all acceptance criteria
6. **Run tests** - `npm run test`
7. **Fix issues** - Iterate until all tests pass
8. **Type check** - `npm run type-check`
9. **Lint** - `npm run lint`
10. **Mark complete** - Update checklist

### Example Implementation Session:

```bash
# Day 1 - Morning: Design Tokens
# Create src/styles/tokens.ts
# Create src/styles/__tests__/tokens.test.ts
npm run test
npm run type-check

# Day 1 - Afternoon: Icon Component
# Create src/components/atoms/Icon.tsx
# Create src/components/atoms/__tests__/Icon.test.tsx
npm run test
npm run type-check

# Day 2 - Morning: Button + Input
# Create src/components/atoms/Button.tsx
# Create src/components/atoms/__tests__/Button.test.tsx
# Create src/components/atoms/Input.tsx
# Create src/components/atoms/__tests__/Input.test.tsx
npm run test
npm run type-check

# Day 2 - Afternoon: Alert + FormField
# Create src/components/molecules/Alert.tsx
# Create src/components/molecules/__tests__/Alert.test.tsx
# Create src/components/molecules/FormField.tsx
# Create src/components/molecules/__tests__/FormField.test.tsx
npm run test
npm run type-check

# Final validation
npm run lint
npm run build
```

---

## Quality Gates

Before marking implementation complete, ensure:

✅ **All unit tests pass** (40+ tests)
✅ **TypeScript compiles** with no errors (`npm run type-check`)
✅ **No linting errors** (`npm run lint`)
✅ **Build succeeds** (`npm run build`)
✅ **All acceptance criteria checked** (see checklist above)
✅ **Components use design tokens** (no hardcoded values)
✅ **Accessibility requirements met** (ARIA attributes, keyboard support)
✅ **Visual review complete** (check in browser or Storybook)

---

## Timeline Estimate

| Phase | Components | Duration | Developer |
|-------|-----------|----------|-----------|
| Phase 0 | Design Tokens | 2-3 hours | 1 |
| Phase 1.1 | Icon | 1-2 hours | 1 |
| Phase 1.2 | Button | 2-3 hours | 1 |
| Phase 1.3 | Input | 2-3 hours | 1 |
| Phase 2.1 | Alert | 1.5-2 hours | 1 |
| Phase 2.2 | FormField | 1.5-2 hours | 1 |
| **Total** | **6 components** | **10-15 hours** | **2-3 days** |

**Buffer**: Add 20% buffer for unexpected issues = **12-18 hours** total

**Parallel Development** (if 2 developers available):
- Developer 1: Tokens → Icon → Button → Alert
- Developer 2: (waits for Icon) → Input → FormField
- Timeline: **1.5-2 days** instead of 2-3 days

---

## Next Steps After Components Complete

Once all components are implemented and tested:

1. **Feature Implementation**: Start US-A1 (Login screen)
   - Use FormField for ID and password inputs
   - Use Button for "Entrar" action
   - Use Alert for error messages
   - File: `src/features/auth/LoginScreen.tsx`

2. **Integration Testing**: Create E2E test for login flow
   - File: `e2e/login.spec.ts`
   - Test happy path, error cases, offline scenarios

3. **Visual Review**: Show login screen to stakeholders for feedback

4. **Continue M1**: Move to US-B1 (Initial sync) implementation

---

## References

- **Component Specs**: `docs/specs/components/`
- **Master Plan**: `docs/master-plan.md`
- **Technical Specs**: `TECHNICAL-SPECS.md`
- **Backlog**: `docs/backlog.csv`
- **Project Plan**: `docs/plan-and-wbs.md`

---

**Status**: ✅ Ready to begin implementation

**Checkpoint**: Before implementing, ensure all developers have read:
1. Component specifications (5 files in `docs/specs/components/`)
2. This component plan document
3. Language conventions in `CLAUDE.md` (code in English, UI in Spanish)
4. Design tokens spec for token usage patterns
