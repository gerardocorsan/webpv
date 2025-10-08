# Icon Component Specification

**Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Approved
**Type**: Atom

## Overview

Icon component renders vector icons from Material Design Icons or custom SVG sources. Used throughout the app for visual communication and improving affordance of interactive elements.

**Based on**: Technical Implementation Guide - Icon specification and Material Design 3 guidelines

---

## Variants

### 1. Material Icon (Default)
- Uses Material Design Icons font
- Pass icon name as string
- Example: "check_circle", "error", "visibility"

### 2. Custom SVG
- Inline SVG content
- Fully customizable
- Example: Company logo, custom graphics

---

## Visual Specifications

### Dimensions

```typescript
// Standard sizes
sm: 16px × 16px        // Small - Inline with text, indicators
md: 24px × 24px        // Medium - Default, buttons, inputs
lg: 32px × 32px        // Large - Headers, prominent actions
xl: 48px × 48px        // Extra large - Empty states, illustrations
```

### Default Size
- Default to `md` (24×24px) - Material Design standard
- Icons should maintain aspect ratio (square)

### Colors

```typescript
// Semantic colors
primary: tokens.colors.primary.main (#0A7D2B)
secondary: tokens.colors.text.secondary (#666666)
error: tokens.colors.semantic.error (#D8262C)
success: tokens.colors.primary.main (#0A7D2B)
warning: tokens.colors.semantic.warning (#F59E0B)
info: tokens.colors.semantic.info (#2196F3)

// Neutral colors
white: #FFFFFF
gray: #9CA3AF
black: #333333

// Custom color
inherit: inherits from parent color
custom: any hex/rgb value
```

---

## TypeScript Interface

```typescript
export interface IconProps {
  /**
   * Material icon name OR custom SVG element
   * Material icons: 'check_circle', 'error', 'visibility', etc.
   * @example 'check_circle'
   */
  name?: string;

  /**
   * Custom SVG element (alternative to name)
   */
  children?: React.ReactNode;

  /**
   * Icon size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;

  /**
   * Icon color (semantic or custom)
   * @default 'inherit'
   */
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'white' | 'gray' | 'black' | 'inherit' | string;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * ARIA label for accessibility
   * Required for standalone icons with semantic meaning
   */
  ariaLabel?: string;

  /**
   * Hide icon from screen readers (decorative only)
   * @default false
   */
  ariaHidden?: boolean;

  /**
   * Click handler (if icon is interactive)
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}
```

---

## Material Design Icons Reference

### Common Icons Used in App

```typescript
// Navigation
'arrow_back'           // Back button
'arrow_forward'        // Next button
'menu'                 // Menu icon
'close'                // Close/dismiss

// Actions
'add'                  // Add new item
'edit'                 // Edit action
'delete'               // Delete action
'save'                 // Save action
'sync'                 // Sync/refresh
'search'               // Search input

// Status
'check_circle'         // Success
'error'                // Error
'warning'              // Warning
'info'                 // Information
'offline_bolt'         // Offline mode

// Forms
'visibility'           // Show password
'visibility_off'       // Hide password
'check_box'            // Checkbox checked
'check_box_outline_blank' // Checkbox unchecked

// Other
'location_on'          // Geolocation
'calendar_today'       // Date
'person'               // User profile
'cloud_off'            // No connection
```

---

## Usage Examples

### Basic Material Icon

```tsx
import { Icon } from '@/components/atoms/Icon';

<Icon name="check_circle" />
```

### Icon with Size

```tsx
<Icon name="search" size="lg" />
```

### Icon with Color

```tsx
<Icon name="error" color="error" />
```

### Icon with Custom Color

```tsx
<Icon name="sync" color="#0A7D2B" />
```

### Icon with ARIA Label (Standalone)

```tsx
<Icon name="info" ariaLabel="Información adicional" />
```

### Decorative Icon (Hidden from Screen Readers)

```tsx
<Icon name="star" ariaHidden />
```

### Interactive Icon with Click Handler

```tsx
<button onClick={handleClose}>
  <Icon name="close" ariaLabel="Cerrar" size="sm" />
</button>
```

### Custom SVG Icon

```tsx
<Icon ariaLabel="Logo de la empresa">
  <svg viewBox="0 0 24 24">
    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
  </svg>
</Icon>
```

### Icon in Button (with Text)

```tsx
import { Button } from '@/components/atoms/Button';

<Button startIcon={<Icon name="sync" ariaHidden />}>
  Sincronizar
</Button>
```

### Icon in Input (Password Toggle)

```tsx
<button
  onClick={togglePasswordVisibility}
  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
>
  <Icon name={showPassword ? 'visibility_off' : 'visibility'} ariaHidden />
</button>
```

### Loading Spinner Icon

```tsx
<Icon
  name="sync"
  className="icon-spin"
  ariaLabel="Cargando"
/>

// CSS for spinning animation
.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Accessibility Requirements

### ARIA Attributes

```typescript
// For icons with semantic meaning (standalone)
role="img"
aria-label="Descriptive label in Spanish"

// For decorative icons (next to text)
aria-hidden="true"

// For icons inside buttons/links
// Icon should be aria-hidden, button/link has aria-label
<button aria-label="Cerrar ventana">
  <Icon name="close" ariaHidden />
</button>
```

### Decision Tree: When to Use aria-label vs aria-hidden

**Use `ariaLabel` (and `role="img"`):**
- Icon stands alone (no accompanying text)
- Icon conveys important information
- Icon is the only child of an interactive element
- Example: Icon-only buttons

**Use `ariaHidden={true}`:**
- Icon is decorative
- Icon has adjacent text that explains the action/meaning
- Icon is redundant with visible text
- Example: Icon next to button text

### Examples

```tsx
// ✓ Correct: Icon-only button with aria-label
<button onClick={handleSave}>
  <Icon name="save" ariaLabel="Guardar cambios" />
</button>

// ✓ Correct: Icon with text, icon is decorative
<button onClick={handleSave}>
  <Icon name="save" ariaHidden />
  Guardar
</button>

// ✗ Incorrect: Icon with text but also has aria-label
<button onClick={handleSave}>
  <Icon name="save" ariaLabel="Guardar" />
  Guardar
</button>
```

---

## Implementation Notes

### 1. Material Icons Font

Include Material Icons in the app:

```html
<!-- In index.html -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

Or install as npm package:
```bash
npm install material-icons
```

### 2. Icon Component Implementation

```tsx
import { tokens } from '@/styles/tokens';

const sizeMap = {
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
};

const colorMap = {
  primary: tokens.colors.primary.main,
  secondary: tokens.colors.text.secondary,
  error: tokens.colors.semantic.error,
  success: tokens.colors.primary.main,
  warning: tokens.colors.semantic.warning,
  info: tokens.colors.semantic.info,
  white: '#FFFFFF',
  gray: '#9CA3AF',
  black: '#333333',
  inherit: 'inherit',
};

export function Icon({
  name,
  children,
  size = 'md',
  color = 'inherit',
  className,
  ariaLabel,
  ariaHidden = false,
  onClick,
}: IconProps) {
  const sizeValue = typeof size === 'number' ? `${size}px` : sizeMap[size];
  const colorValue = colorMap[color] || color;

  // Custom SVG
  if (children) {
    return (
      <span
        role={ariaLabel ? 'img' : undefined}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        onClick={onClick}
        className={className}
        style={{
          display: 'inline-flex',
          width: sizeValue,
          height: sizeValue,
          color: colorValue,
        }}
      >
        {children}
      </span>
    );
  }

  // Material Icon
  return (
    <span
      className={`material-icons ${className || ''}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      onClick={onClick}
      style={{
        fontSize: sizeValue,
        width: sizeValue,
        height: sizeValue,
        color: colorValue,
      }}
    >
      {name}
    </span>
  );
}
```

### 3. Custom SVG Sizing

When using custom SVG, ensure the SVG has proper `viewBox` and no hardcoded width/height:

```tsx
// ✓ Correct
<Icon size="md">
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="..." />
  </svg>
</Icon>

// ✗ Incorrect (hardcoded size)
<Icon size="md">
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
</Icon>
```

### 4. Color Inheritance

Icons should inherit color from parent by default (`color="inherit"`), allowing flexible styling:

```tsx
<div style={{ color: '#0A7D2B' }}>
  <Icon name="check" /> Success!
</div>
```

---

## Testing Requirements

```typescript
describe('Icon', () => {
  it('renders Material icon with name', () => {
    render(<Icon name="check_circle" />);
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('renders custom SVG icon', () => {
    render(
      <Icon ariaLabel="Custom icon">
        <svg data-testid="custom-svg"><path /></svg>
      </Icon>
    );
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
  });

  it('applies size correctly', () => {
    render(<Icon name="info" size="lg" />);
    const icon = screen.getByText('info');
    expect(icon).toHaveStyle({ fontSize: '32px' });
  });

  it('applies color correctly', () => {
    render(<Icon name="error" color="error" />);
    const icon = screen.getByText('error');
    expect(icon).toHaveStyle({ color: '#D8262C' });
  });

  it('applies custom color', () => {
    render(<Icon name="sync" color="#FF0000" />);
    const icon = screen.getByText('sync');
    expect(icon).toHaveStyle({ color: '#FF0000' });
  });

  it('has aria-label when provided', () => {
    render(<Icon name="info" ariaLabel="Información" />);
    expect(screen.getByLabelText('Información')).toBeInTheDocument();
  });

  it('is hidden from screen readers when ariaHidden is true', () => {
    render(<Icon name="star" ariaHidden />);
    const icon = screen.getByText('star');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Icon name="close" onClick={handleClick} />);
    fireEvent.click(screen.getByText('close'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Acceptance Criteria

- [ ] Material icons render with correct name
- [ ] Custom SVG icons render correctly
- [ ] All size variants (sm, md, lg, xl) apply correct dimensions
- [ ] Color variants apply correct colors from tokens
- [ ] Custom colors can be provided as hex/rgb strings
- [ ] ariaLabel sets role="img" and aria-label
- [ ] ariaHidden hides icon from screen readers
- [ ] Icon inherits color by default
- [ ] onClick handler is called when icon is clicked
- [ ] Icons maintain aspect ratio (square)
- [ ] All unit tests pass

---

## Dependencies

- **Tokens**: `src/styles/tokens.ts` - Color and size tokens
- **Material Icons**: Google Material Icons font or npm package
- **Types**: `src/types/index.ts` - Common types

---

## References

- Material Design 3 - Icons
- Material Icons Library: https://fonts.google.com/icons
- WCAG 2.1 - Icon accessibility
- Technical Implementation Guide v1.0

---

**Status**: ✅ Ready for implementation
