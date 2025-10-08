# Alert Component Specification

**Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Approved
**Type**: Molecule

## Overview

Alert component displays important messages to users in different contextual styles (error, success, warning, info). Can be dismissible or persistent.

**Based on**: Technical Implementation Guide - Alert/Banner specification

---

## Variants

### 1. Error Alert
- Red color scheme
- Critical errors, validation failures
- Example: "Credenciales inválidas"

### 2. Success Alert
- Green color scheme
- Successful operations
- Example: "Sincronización completa. ¡Buen trabajo hoy!"

### 3. Warning Alert
- Yellow/Orange color scheme
- Warnings that need attention
- Example: "Estás fuera de la geocerca (±20 m.)"

### 4. Info Alert
- Blue color scheme
- Informational messages, offline state
- Example: "Tienes 1 recomendación sin feedback"

---

## Visual Specifications

### Dimensions

```typescript
minHeight: 48px
paddingHorizontal: 16px
paddingVertical: 12px
borderRadius: 8px
gap: 12px              // Space between icon and text
```

### Colors

```typescript
// Error
background: tokens.colors.semantic.errorBg (#FEE2E2)
text: tokens.colors.semantic.error (#D8262C)
icon: tokens.colors.semantic.error

// Success
background: tokens.colors.semantic.successBg (#D1FAE5)
text: tokens.colors.primary.main (#0A7D2B)
icon: tokens.colors.primary.main

// Warning
background: tokens.colors.semantic.warningBg (#FEF3C7)
text: tokens.colors.semantic.warning (#F59E0B)
icon: tokens.colors.semantic.warning

// Info
background: tokens.colors.semantic.infoBg (#DBEAFE)
text: tokens.colors.semantic.info (#2196F3)
icon: tokens.colors.semantic.info
```

### Typography

```typescript
fontSize: 14px
fontWeight: 400
lineHeight: 1.5
```

---

## TypeScript Interface

```typescript
export interface AlertProps {
  /**
   * Alert variant determines color scheme
   * @default 'info'
   */
  variant: 'error' | 'success' | 'warning' | 'info';

  /**
   * Alert message content
   */
  children: React.ReactNode;

  /**
   * Show close button
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;

  /**
   * Show icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom icon (overrides default variant icon)
   */
  icon?: React.ReactNode;

  /**
   * Additional CSS class
   */
  className?: string;
}
```

---

## Default Icons by Variant

```typescript
const variantIcons = {
  error: 'error',           // Material Icon: error
  success: 'check_circle',   // Material Icon: check_circle
  warning: 'warning',        // Material Icon: warning
  info: 'info',             // Material Icon: info
};
```

---

## Usage Examples

### Error Alert

```tsx
import { Alert } from '@/components/molecules/Alert';

<Alert variant="error">
  Credenciales inválidas
</Alert>
```

### Success Alert with Custom Duration

```tsx
const [showSuccess, setShowSuccess] = useState(false);

useEffect(() => {
  if (showSuccess) {
    const timer = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(timer);
  }
}, [showSuccess]);

{showSuccess && (
  <Alert variant="success">
    Sincronización completa. ¡Buen trabajo hoy!
  </Alert>
)}
```

### Dismissible Warning Alert

```tsx
const [showWarning, setShowWarning] = useState(true);

{showWarning && (
  <Alert
    variant="warning"
    dismissible
    onDismiss={() => setShowWarning(false)}
  >
    Estás fuera de la geocerca (±20 m.)
  </Alert>
)}
```

### Info Alert without Icon

```tsx
<Alert variant="info" showIcon={false}>
  Tienes 1 recomendación sin feedback
</Alert>
```

### Alert with Custom Icon

```tsx
<Alert
  variant="info"
  icon={<Icon name="cloud_off" />}
>
  Sin conexión. Trabajando localmente.
</Alert>
```

---

## Accessibility Requirements

```typescript
// Alert container
role="alert"              // For immediate announcement
aria-live="polite"        // For non-critical messages
aria-live="assertive"     // For error messages

// Dismiss button (if dismissible)
aria-label="Cerrar alerta"
```

---

## Testing Requirements

```typescript
describe('Alert', () => {
  it('renders with message', () => {
    render(<Alert variant="info">Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('shows error variant with correct styles', () => {
    render(<Alert variant="error">Error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ background: '#FEE2E2' });
  });

  it('shows icon by default', () => {
    render(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(<Alert variant="info" showIcon={false}>Info</Alert>);
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible', () => {
    render(<Alert variant="info" dismissible>Info</Alert>);
    expect(screen.getByLabelText('Cerrar alerta')).toBeInTheDocument();
  });

  it('calls onDismiss when close button clicked', () => {
    const handleDismiss = vi.fn();
    render(<Alert variant="info" dismissible onDismiss={handleDismiss}>Info</Alert>);

    fireEvent.click(screen.getByLabelText('Cerrar alerta'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
```

---

## Acceptance Criteria

- [ ] Four variants (error, success, warning, info) render with correct colors
- [ ] Icon shows by default with variant-specific icon
- [ ] Icon can be hidden with showIcon={false}
- [ ] Custom icon can be provided
- [ ] Dismiss button shows when dismissible={true}
- [ ] onDismiss callback is called when dismissed
- [ ] role="alert" is set for screen reader announcement
- [ ] Alert has proper contrast ratio (WCAG AA)
- [ ] All unit tests pass

---

## Dependencies

- **Icon**: `src/components/atoms/Icon.tsx`
- **Tokens**: `src/styles/tokens.ts`

---

**Status**: ✅ Ready for implementation
