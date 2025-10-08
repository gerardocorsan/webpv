# Component Analysis & Implementation Recommendations - M1

## Overview

This document contains the component analysis from prototype screens and implementation recommendations for Milestone 1 (Week 1).

**Analysis Date**: 2025-09-30
**Scope**: All 11 prototype screens analyzed
**Goal**: Define minimal component set for M1 delivery

---

## 📊 Complete Component Inventory

### 🔴 ATOMS (10 base components)

#### 1. **Button** (3 variants)
- **Primary** (green): "Entrar", "Guardar", "Continuar", "Finalizar visita"
- **Secondary** (white with border): "Cancelar"
- **Action** (green, small size): "Registrar feedback", "Reintentar"

#### 2. **Input**
- **TextInput**: ID de asesor, SKU search
- **PasswordInput**: With show/hide toggle
- **SearchInput**: With search icon
- **TextArea**: Optional notes (0/250 character counter)

#### 3. **Toggle/Switch**
- "Recordarme" / "Mantener sesión iniciada"

#### 4. **Badge**
- **Status**: "Pendientes (3)", "Sin stock", "3 seleccionados"
- **Priority**: "Prioridad crítica"
- **Level**: "Bajo", "Medio", "Alto" (green variants)

#### 5. **Avatar**
- Circles with client initials (A, M)

#### 6. **Icon**
- Checkmark, Error, Warning, Arrow, Eye, Location, Sync

#### 7. **Checkbox**
- Multiple SKU selection

#### 8. **Chip/Tag**
- **Selectable**: "Aceptada", "Rechazada", "Parcial"
- **Filter**: "Pendientes", "Todos", "Activos"

#### 9. **Dropdown/Select**
- Select rejection reason

#### 10. **ProgressBar**
- Horizontal sync progress bar

---

### 🟡 MOLECULES (9 compound components)

#### 1. **FormField**
- Label + Input + Inline error message
- Example: "ID de asesor" + input + "ID inválido"

#### 2. **Alert/Banner** (4 variants)
- **Error** (red): "Credenciales inválidas"
- **Warning** (yellow): "Estás fuera de la geocerca (±20 m.)"
- **Info** (orange): "Tienes 1 recomendación sin feedback"
- **Success** (green): "Sincronización completa. ¡Buen trabajo hoy!"

#### 3. **ListItem** (3 variants)
- **Client**: Avatar + Name + Subtitle + Arrow
- **Recommendation**: Bullet + Title + Vigencia + Action button
- **Dataset**: Checkmark + Name + Size + Timestamp

#### 4. **Card**
- Client detail header with badges and data
- Visit summary with metrics

#### 5. **TabBar**
- Selectable tabs: "Pendientes (3)", "Todos", "Activos"

#### 6. **DataRow** (2 variants)
- **SKU row**: Checkbox + Name + Description + Badge + Last movement
- **Inventory row**: SKU + Level badges + Price + Stock indicators

#### 7. **ActionButtonGroup**
- Horizontal group of 3 quick action buttons

#### 8. **StatItem**
- Label + Value pairs
- Example: "Inicio: 09:12", "Acciones atendidas: 2 de 3"

#### 9. **ProgressItem**
- Checkmark + Dataset name + Size + Status text

---

### 🟢 ORGANISMS

Login forms, sync progress screens, client lists, client detail headers, etc.
These are implemented within each feature module, not in shared components.

---

## 🎯 M1 Implementation Strategy (Week 1)

### Phase 1: Essentials for Login + Sync (Day 1-2)

**Must Create Now:**

```
src/components/atoms/
├── Button.tsx           ⭐ CRITICAL - used everywhere
├── Input.tsx            ⭐ CRITICAL - login, search
├── Icon.tsx             ⭐ CRITICAL - checkmarks, arrows, status
├── ProgressBar.tsx      ⭐ For sync screen
└── Badge.tsx            Useful for counters

src/components/molecules/
├── FormField.tsx        ⭐ CRITICAL - all forms
├── Alert.tsx            ⭐ CRITICAL - errors and success messages
└── ProgressItem.tsx     ⭐ For dataset list in sync
```

**Estimated Time**: 3-4 hours
- Button, Input, Icon: 1.5h
- FormField, Alert: 1h
- ProgressBar, ProgressItem: 1h
- Basic tests: 30min

### Phase 2: For Daily List (Day 3-4)

**Create When Needed:**

```
src/components/atoms/
├── Avatar.tsx           For client initials
└── Chip.tsx             For filter tabs

src/components/molecules/
├── ListItem.tsx         ⭐ CRITICAL - client list
├── TabBar.tsx           For Pendientes/Todos/Activos filters
└── Card.tsx             For client detail view
```

**Estimated Time**: 2-3 hours

### Phase 3: Deferred to M2 (Week 2)

**Create Only When Implementing These Features:**

```
- Toggle/Switch          (For feedback form)
- Checkbox               (For stockout selection)
- Dropdown               (For rejection reasons)
- DataRow                (For inventory tables)
- ActionButtonGroup      (For quick actions in list)
```

---

## 📋 Recommended Approach

### Option A: Create Essential Components First (3-4 hours)
**Pros:**
- Clean separation of concerns
- Reusable from day 1
- Type-safe component API
- Consistent styling

**Cons:**
- Upfront time investment
- May over-engineer if requirements change

### Option B: Just-in-Time (JIT) Component Creation
**Pros:**
- Faster initial velocity
- Build only what's needed
- Adapt to real requirements

**Cons:**
- May create inconsistencies
- Harder to refactor later
- Duplicate code risk

---

## ✅ Final Recommendation

**Hybrid Approach - Option A Modified**

Create only **5 critical components** upfront (2 hours):

### Phase 0: Minimal Base (Before US-A1)

```typescript
src/components/atoms/
├── Button.tsx           // Primary, secondary variants
├── Input.tsx            // Text, password variants
└── Icon.tsx             // Basic SVG wrapper

src/components/molecules/
├── FormField.tsx        // Label + Input + Error
└── Alert.tsx            // Error, success variants
```

This unblocks **US-A1 (Login)** completely and provides foundation for the rest.

---

## 🔄 Component Creation Workflow

For each component:

1. **Create TypeScript types** in component file
2. **Implement base variant** with required props
3. **Add to Storybook** (if time permits)
4. **Write 2-3 basic tests** (render, props, interaction)
5. **Export from index** for easy imports

### Example Structure:

```typescript
// src/components/atoms/Button.tsx
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function Button({ variant = 'primary', ... }: ButtonProps) {
  // Implementation
}
```

---

## 📐 Design Tokens (from prototype)

### Colors
```typescript
const colors = {
  primary: '#2D7A3E',      // Green (buttons, badges)
  error: '#DC2626',        // Red (errors, alerts)
  warning: '#F59E0B',      // Orange (warnings)
  success: '#10B981',      // Green (success messages)
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
  }
};
```

### Spacing
```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
};
```

### Typography
```typescript
const typography = {
  h1: '1.5rem',    // 24px - Page titles
  h2: '1.25rem',   // 20px - Section titles
  body: '1rem',    // 16px - Regular text
  small: '0.875rem', // 14px - Secondary text
};
```

### Border Radius
```typescript
const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  full: '9999px',  // Circular
};
```

---

## 🎨 Component Style Guidelines

### Accessibility
- All interactive elements min 44x44px touch target
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators visible (2px outline)
- Semantic HTML (button, input, etc.)
- ARIA labels where needed

### Mobile-First
- Design for mobile (320px+)
- Touch-friendly spacing
- Responsive font sizes
- Bottom-safe areas for iOS

### Performance
- Lazy load icons (only what's needed)
- Memoize expensive computations
- Avoid inline styles when possible
- Use CSS-in-JS efficiently

---

## 📚 References

- **Prototype Screens**: `docs/prototype/*.png`
- **Navigation Flow**: `docs/prototipo-figma.png`
- **User Stories**: `docs/backlog.csv`
- **Technical Specs**: `TECHNICAL-SPECS.md`

---

## 🚀 Next Steps

1. **Review and approve** this component list
2. **Create design tokens** file (`src/styles/tokens.ts`)
3. **Implement Phase 0 components** (2 hours)
4. **Start US-A1 (Login)** using new components
5. **Iterate**: Add components as needed for M1 features

---

**Last Updated**: 2025-09-30
**Status**: Pending approval
**Owner**: Development Team
