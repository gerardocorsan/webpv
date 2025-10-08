# Design Tokens Specification

**Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Approved

## Overview

Design tokens are the foundational visual design atoms of the design system. They define colors, typography, spacing, and other visual properties used consistently across all components.

**Source**: Based on "Guía Técnica de Implementación Frontend (PWA React + Vite)-v1.0.docx"

---

## Color Tokens

### Primary Colors

```typescript
const colors = {
  primary: {
    main: '#0A7D2B',        // Green - Primary actions, buttons, focus states
    light: '#10B981',       // Light green - Success states
    dark: '#065F21',        // Dark green - Hover states
  },
```

### Semantic Colors

```typescript
  semantic: {
    error: '#D8262C',       // Red - Errors, validation failures
    errorBg: '#FEE2E2',     // Light red - Error alert backgrounds

    warning: '#F59E0B',     // Orange/Yellow - Warnings
    warningBg: '#FEF3C7',   // Light yellow - Warning alert backgrounds

    info: '#2196F3',        // Blue - Offline state, informational
    infoBg: '#DBEAFE',      // Light blue - Info alert backgrounds

    success: '#4CAF50',     // Green - Success confirmations
    successBg: '#D1FAE5',   // Light green - Success alert backgrounds
  },
```

### Neutral Colors

```typescript
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',
  },
```

### Text Colors

```typescript
  text: {
    primary: '#333333',     // Main text color
    secondary: '#666666',   // Secondary text, descriptions
    disabled: '#9CA3AF',    // Disabled text
    white: '#FFFFFF',       // Text on dark backgrounds
    error: '#D8262C',       // Error messages
  },
```

### Background Colors

```typescript
  background: {
    primary: '#FFFFFF',     // Main background
    secondary: '#F5F5F5',   // Secondary background, cards
    tertiary: '#F9FAFB',    // Subtle backgrounds
  },
```

### Border Colors

```typescript
  border: {
    default: '#E0E0E0',     // Default borders
    focus: '#0A7D2B',       // Focused input borders
    error: '#D8262C',       // Error state borders
  },
};
```

---

## Typography Tokens

### Font Family

```typescript
const typography = {
  fontFamily: {
    primary: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
```

### Font Sizes

```typescript
  fontSize: {
    xs: '12px',            // 12px - Captions, helper text
    sm: '14px',            // 14px - Body text, secondary info
    base: '16px',          // 16px - Primary body text, inputs
    lg: '18px',            // 18px - Large body text
    xl: '20px',            // 20px - Subtitles, section headers
    '2xl': '22px',         // 22px - Page titles
    '3xl': '24px',         // 24px - Main titles
  },
```

### Font Weights

```typescript
  fontWeight: {
    regular: 400,          // Normal text
    medium: 500,           // Emphasized text, buttons
    bold: 700,             // Headings, strong emphasis
  },
```

### Line Heights

```typescript
  lineHeight: {
    tight: 1.2,            // Headings
    normal: 1.5,           // Body text
    relaxed: 1.75,         // Loose text
  },
};
```

---

## Spacing Tokens

Based on 4px/8dp base unit:

```typescript
const spacing = {
  '0': '0',
  '1': '4px',     // 4px - 0.25rem - xs
  '2': '8px',     // 8px - 0.5rem - sm
  '3': '12px',    // 12px - 0.75rem - md
  '4': '16px',    // 16px - 1rem - lg
  '6': '24px',    // 24px - 1.5rem - xl
  '8': '32px',    // 32px - 2rem - 2xl
  '12': '48px',   // 48px - 3rem - 3xl
  '16': '64px',   // 64px - 4rem - 4xl
};
```

### Common Spacing Usage

- **Component padding**: 16px (spacing['4'])
- **Card/section margin**: 12px (spacing['3'])
- **Button padding horizontal**: 16px (spacing['4'])
- **Input padding**: 12px (spacing['3'])
- **Stack spacing**: 8px (spacing['2'])

---

## Border Radius Tokens

```typescript
const borderRadius = {
  none: '0',
  sm: '4px',              // Small radius - chips, tags
  md: '8dp',              // 8px - Cards, list items
  lg: '12dp',             // 12px - Buttons, inputs
  xl: '16px',             // Extra large radius
  full: '9999px',         // Circular - avatars, pills
};
```

---

## Shadow/Elevation Tokens

Material Design elevation levels:

```typescript
const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',                // Level 1
  md: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',              // Level 2
  lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',              // Level 3
  xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',            // Level 4
};
```

### Elevation Usage

- **Level 1** (sm): Buttons (normal state), subtle cards
- **Level 2** (md): Cards, list items, raised buttons
- **Level 3** (lg): Dropdowns, modals
- **Level 4** (xl): App bar, bottom navigation

---

## Size Tokens

### Touch Targets (Minimum)

```typescript
const touchTargets = {
  minimum: '44px',        // iOS minimum
  recommended: '48px',    // Android minimum (48dp)
};
```

### Component Sizes

```typescript
const componentSizes = {
  button: {
    height: '48dp',       // 48px - Standard button height
    minWidth: '64px',     // Minimum button width
  },
  input: {
    height: '56dp',       // 56px - TextField total height
  },
  icon: {
    sm: '16px',
    md: '24px',           // 24×24dp - Standard icon size
    lg: '32px',
  },
  avatar: {
    sm: '32px',
    md: '40px',           // Standard avatar in lists
    lg: '56px',
  },
  chip: {
    height: '32px',
  },
  banner: {
    height: '48px',       // Offline banner, alerts
  },
};
```

---

## Animation Tokens

```typescript
const animation = {
  duration: {
    fast: '150ms',        // Quick transitions
    normal: '250ms',      // Standard transitions
    slow: '400ms',        // Slow, emphasized transitions
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',     // Material standard
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',   // Deceleration
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',     // Acceleration
  },
};
```

---

## Z-Index Scale

```typescript
const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
```

---

## TypeScript Implementation

### Create tokens file

**File**: `src/styles/tokens.ts`

```typescript
export const tokens = {
  colors: {
    primary: {
      main: '#0A7D2B',
      light: '#10B981',
      dark: '#065F21',
    },
    semantic: {
      error: '#D8262C',
      errorBg: '#FEE2E2',
      warning: '#F59E0B',
      warningBg: '#FEF3C7',
      info: '#2196F3',
      infoBg: '#DBEAFE',
      success: '#4CAF50',
      successBg: '#D1FAE5',
    },
    neutral: {
      white: '#FFFFFF',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray500: '#6B7280',
      gray700: '#374151',
      gray900: '#111827',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#9CA3AF',
      white: '#FFFFFF',
      error: '#D8262C',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#F9FAFB',
    },
    border: {
      default: '#E0E0E0',
      focus: '#0A7D2B',
      error: '#D8262C',
    },
  },

  typography: {
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '22px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    '0': '0',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '6': '24px',
    '8': '32px',
    '12': '48px',
  },

  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
  },
} as const;

export type Tokens = typeof tokens;
```

---

## Usage Guidelines

### 1. **Always use tokens, never hardcode values**

❌ **Wrong**:
```typescript
<button style={{ backgroundColor: '#0A7D2B' }}>Click</button>
```

✅ **Correct**:
```typescript
import { tokens } from '@/styles/tokens';

<button style={{ backgroundColor: tokens.colors.primary.main }}>Click</button>
```

### 2. **Use semantic colors for meaning**

- Use `colors.semantic.error` for errors, not `colors.primary.main`
- Use `colors.semantic.success` for success states
- Use `colors.text.secondary` for less important text

### 3. **Maintain consistent spacing**

Use the spacing scale (4px increments) for all margins, padding, and gaps.

### 4. **Respect touch targets**

All interactive elements must be at least 44px (iOS) or 48px (Android) in size.

### 5. **Use proper typography hierarchy**

- Titles: xl-2xl, bold weight
- Body: base-sm, regular weight
- Captions: xs, regular weight

---

## Accessibility Requirements

- **Color Contrast**: All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Touch Targets**: Minimum 44×44px for iOS, 48×48dp for Android
- **Focus Indicators**: 2px visible outline using `colors.border.focus`
- **Text Sizing**: Support browser text resizing up to 200%

---

## References

- Material Design 3 Guidelines
- iOS Human Interface Guidelines
- WCAG 2.1 Level AA
- Technical Implementation Guide v1.0

---

**Next Steps**:
1. Create `src/styles/tokens.ts` file with these definitions
2. Import tokens in all component files
3. Never hardcode colors, sizes, or spacing values
4. Validate all components use tokens correctly
