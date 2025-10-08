# Button Component Specification

**Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Approved
**Type**: Atom

## Overview

The Button component is the primary interactive element for triggering actions in the application. It supports multiple variants, states, and loading indicators.

**Based on**: Technical Implementation Guide - PrimaryButton specification

---

## Variants

### 1. Primary Button (Default)
- Main call-to-action button
- Green background with white text
- Used for primary actions: "Entrar", "Guardar", "Finalizar visita", "Continuar"

### 2. Secondary Button
- Secondary actions or cancel actions
- White background with green border and green text
- Used for: "Cancelar", "Atrás"

### 3. Action Button (Small)
- Smaller variant for inline actions
- Same styling as primary but reduced size
- Used for: "Registrar feedback", "Reintentar"

---

## Visual Specifications

### Dimensions

```typescript
// Primary & Secondary
height: 48px (48dp)         // Meets minimum touch target
minWidth: 64px              // Minimum width
maxWidth: 312px             // Maximum width
paddingHorizontal: 16px
paddingVertical: 12px
borderRadius: 12px

// Action (Small variant)
height: 36px
minWidth: 48px
paddingHorizontal: 12px
paddingVertical: 8px
borderRadius: 8px
```

### Typography

```typescript
fontSize: 16px              // Primary & Secondary
fontSize: 14px              // Action (small)
fontWeight: 500             // Medium
textTransform: none         // Keep original case
letterSpacing: 0.5px
```

### Colors

#### Primary Variant

```typescript
// Normal state
background: tokens.colors.primary.main (#0A7D2B)
color: tokens.colors.text.white (#FFFFFF)
border: none
shadow: tokens.shadows.sm

// Hover state
background: tokens.colors.primary.dark (#065F21)
shadow: tokens.shadows.md

// Pressed/Active state
background: tokens.colors.primary.dark (#065F21)
transform: translateY(1px)
shadow: none

// Disabled state
background: rgba(10, 125, 43, 0.38)  // primary.main at 38% opacity
color: rgba(255, 255, 255, 0.60)
cursor: not-allowed
shadow: none

// Loading state
background: tokens.colors.primary.main
opacity: 0.8
cursor: wait
```

#### Secondary Variant

```typescript
// Normal state
background: tokens.colors.background.primary (#FFFFFF)
color: tokens.colors.primary.main (#0A7D2B)
border: 1px solid tokens.colors.primary.main
shadow: none

// Hover state
background: rgba(10, 125, 43, 0.04)  // Very light green tint
border: 1px solid tokens.colors.primary.dark
shadow: tokens.shadows.sm

// Pressed/Active state
background: rgba(10, 125, 43, 0.08)
transform: translateY(1px)

// Disabled state
background: tokens.colors.background.primary
color: tokens.colors.text.disabled (#9CA3AF)
border: 1px solid tokens.colors.border.default (#E0E0E0)
cursor: not-allowed

// Loading state
background: tokens.colors.background.primary
opacity: 0.8
cursor: wait
```

---

## TypeScript Interface

```typescript
export interface ButtonProps {
  /**
   * Variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';

  /**
   * Size of the button
   * @default 'medium'
   */
  size?: 'small' | 'medium';

  /**
   * Text label to display in the button
   */
  children: React.ReactNode;

  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Disables the button and prevents interactions
   * @default false
   */
  disabled?: boolean;

  /**
   * Shows loading spinner and disables interactions
   * @default false
   */
  loading?: boolean;

  /**
   * HTML button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Full width button (100% of container)
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Icon to show before the label (left side)
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to show after the label (right side)
   */
  endIcon?: React.ReactNode;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}
```

---

## States & Behavior

### State Transitions

```
[Normal] ─hover→ [Hover] ─mousedown→ [Pressed] ─mouseup→ [Normal]
    │
    └─disabled=true→ [Disabled]
    │
    └─loading=true→ [Loading]
```

### Loading State

When `loading={true}`:
1. Button becomes disabled (no click events)
2. Spinner icon appears to the left of text
3. Button shows reduced opacity (0.8)
4. Cursor changes to `wait`
5. Button maintains its dimensions (no layout shift)

**Loading Indicator**:
- Size: 16px × 16px
- Color: Same as button text color
- Position: 8px left margin from text
- Animation: Continuous 360° rotation, 1s duration

---

## Accessibility Requirements

### ARIA Attributes

```typescript
// Button always includes
role="button"                    // Implicit in <button> element
aria-disabled={disabled}         // When disabled
aria-label={ariaLabel}          // If provided
aria-busy={loading}             // When loading

// For icon-only buttons (no children text)
aria-label="required"           // Must provide descriptive label
```

### Keyboard Support

| Key | Action |
|-----|--------|
| `Enter` | Triggers onClick |
| `Space` | Triggers onClick |
| `Tab` | Moves focus to/from button |

### Focus Indicator

```typescript
// Visible focus ring
outline: 2px solid tokens.colors.border.focus (#0A7D2B)
outlineOffset: 2px
```

### Screen Reader Announcements

- Disabled: "Button name, dimmed" or "unavailable"
- Loading: "Button name, busy"
- Normal: "Button name, button"

---

## Usage Examples

### Basic Primary Button

```tsx
import { Button } from '@/components/atoms/Button';

<Button onClick={handleSubmit}>
  Guardar
</Button>
```

### Secondary Button

```tsx
<Button variant="secondary" onClick={handleCancel}>
  Cancelar
</Button>
```

### Loading State

```tsx
<Button loading={isSubmitting}>
  {isSubmitting ? 'Guardando...' : 'Guardar'}
</Button>
```

### Disabled Button

```tsx
<Button disabled={!isFormValid} onClick={handleSubmit}>
  Finalizar visita
</Button>
```

### Full Width Button

```tsx
<Button fullWidth onClick={handleLogin}>
  Entrar
</Button>
```

### Button with Icon

```tsx
import { Icon } from '@/components/atoms/Icon';

<Button
  startIcon={<Icon name="sync" />}
  onClick={handleSync}
>
  Sincronizar
</Button>
```

### Small Action Button

```tsx
<Button size="small" onClick={handleFeedback}>
  Registrar feedback
</Button>
```

### Icon-Only Button (Requires aria-label)

```tsx
<Button
  ariaLabel="Cerrar"
  onClick={handleClose}
>
  <Icon name="close" />
</Button>
```

---

## Implementation Notes

### 1. Touch Target Compliance

- Minimum button height is 48px (48dp) to meet Android guidelines
- Even with size="small" (36px visual), add invisible padding to reach 48px touch target
- Ensure minimum 8px spacing between adjacent buttons

### 2. Loading Spinner

- Use CSS animation for spinner rotation
- Spinner should be inline with text (not absolute positioned)
- Maintain button width when showing spinner (prevent layout shift)

### 3. Disabled State Behavior

- Prevent all pointer events (`pointer-events: none` not recommended, use event handlers)
- Show disabled cursor (`cursor: not-allowed`)
- Reduce opacity to indicate unavailable state
- Do not show hover effects when disabled

### 4. Form Integration

- When `type="submit"`, pressing Enter in form triggers button
- Button should be disabled while form is submitting
- Use `loading` prop to show submission in progress

### 5. Error Handling

```tsx
// Example: Handle async operations with error state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

const handleClick = async () => {
  setIsLoading(true);
  setError('');

  try {
    await submitForm();
  } catch (err) {
    setError('Error al guardar');
  } finally {
    setIsLoading(false);
  }
};

<Button loading={isLoading} onClick={handleClick}>
  Guardar
</Button>
{error && <Alert variant="error">{error}</Alert>}
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('has correct aria-label', () => {
    render(<Button ariaLabel="Submit form">Save</Button>);
    expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Click</Button>);
    const button = screen.getByText('Click');
    expect(button).toHaveStyle({ background: '#FFFFFF' });
  });
});
```

### E2E Tests

```typescript
test('button click triggers action', async ({ page }) => {
  await page.goto('/login');
  await page.click('button:has-text("Entrar")');
  await expect(page).toHaveURL('/sync');
});

test('loading button is not clickable', async ({ page }) => {
  await page.goto('/form');
  const button = page.locator('button:has-text("Guardar")');
  await button.click();

  // Button should show loading state
  await expect(button).toHaveAttribute('aria-busy', 'true');

  // Clicking again should not trigger another request
  await button.click();
  // Assert only one request was made
});
```

---

## Acceptance Criteria

- [ ] Primary and secondary variants render correctly
- [ ] All states (normal, hover, pressed, disabled, loading) display properly
- [ ] onClick handler is called on click (unless disabled or loading)
- [ ] Loading spinner appears when loading={true}
- [ ] Button is not clickable when disabled or loading
- [ ] Minimum touch target of 48×48px is maintained
- [ ] Focus indicator is visible and meets WCAG AA
- [ ] Keyboard navigation works (Enter, Space)
- [ ] Screen reader announces button state correctly
- [ ] Small size variant renders at 36px height
- [ ] Full width variant takes 100% of container width
- [ ] Icons (startIcon, endIcon) display correctly
- [ ] All unit tests pass
- [ ] Visual regression tests pass

---

## Dependencies

- **Tokens**: `src/styles/tokens.ts` - Design tokens for colors, spacing, typography
- **Icon**: `src/components/atoms/Icon.tsx` - For loading spinner and optional icons
- **Types**: `src/types/index.ts` - Common type definitions

---

## References

- Technical Implementation Guide v1.0 - PrimaryButton specification
- Material Design 3 - Button component
- iOS Human Interface Guidelines - Buttons
- WCAG 2.1 - Button accessibility requirements

---

**Status**: ✅ Ready for implementation