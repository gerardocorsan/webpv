# Input Component Specification

**Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Approved
**Type**: Atom

## Overview

The Input component is a base text input field used for form data entry. It supports various types (text, password, email, number), validation states, and optional icons.

**Based on**: Technical Implementation Guide - TextField (base input) specification

---

## Variants

### 1. Text Input (Default)
- Standard text entry field
- Used for: ID de asesor, nombres, notas

### 2. Password Input
- Masked text entry with show/hide toggle
- Eye icon to reveal/hide password
- Used for: Contraseña

### 3. Search Input
- Text input with search icon
- Used for: Búsqueda de SKU o presentación

### 4. TextArea
- Multi-line text input
- Character counter (e.g., 0/250)
- Used for: Notas opcionales

---

## Visual Specifications

### Dimensions

```typescript
// Standard Input
height: 48px                // Input field height
minWidth: 200px
paddingHorizontal: 12px
paddingVertical: 12px
borderRadius: 8px

// TextArea
minHeight: 80px
maxHeight: 200px            // Allow vertical resize
paddingHorizontal: 12px
paddingVertical: 12px
borderRadius: 8px
```

### Typography

```typescript
// Input text
fontSize: 16px              // Actual input text (prevents zoom on iOS)
fontWeight: 400             // Regular
color: tokens.colors.text.primary (#333333)

// Placeholder
fontSize: 16px
fontWeight: 400
color: tokens.colors.text.secondary (#666666)
```

### Colors & Borders

```typescript
// Normal state
background: tokens.colors.background.primary (#FFFFFF)
border: 1px solid tokens.colors.border.default (#E0E0E0)
borderRadius: 8px

// Focused state
border: 2px solid tokens.colors.border.focus (#0A7D2B)
outline: none               // Remove default browser outline

// Filled state (has value)
border: 1px solid tokens.colors.border.default
background: tokens.colors.background.primary

// Error state
border: 2px solid tokens.colors.semantic.error (#D8262C)
color: tokens.colors.text.error (#D8262C)

// Disabled state
background: tokens.colors.neutral.gray100 (#F3F4F6)
border: 1px solid tokens.colors.neutral.gray200 (#E5E7EB)
color: tokens.colors.text.disabled (#9CA3AF)
cursor: not-allowed
```

---

## TypeScript Interface

```typescript
export interface InputProps {
  /**
   * Input type
   * @default 'text'
   */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

  /**
   * Input name attribute (for forms)
   */
  name?: string;

  /**
   * Controlled input value
   */
  value: string;

  /**
   * Change handler - receives new value
   */
  onChange: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether the field has an error
   * @default false
   */
  hasError?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Required field
   * @default false
   */
  required?: boolean;

  /**
   * Read-only state
   * @default false
   */
  readOnly?: boolean;

  /**
   * Auto-focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Autocomplete attribute
   * @default 'off'
   */
  autoComplete?: string;

  /**
   * Maximum length
   */
  maxLength?: number;

  /**
   * Icon to show on the left side
   */
  startIcon?: React.ReactNode;

  /**
   * Icon to show on the right side
   */
  endIcon?: React.ReactNode;

  /**
   * For password type: show/hide toggle
   * @default true (for password type)
   */
  showPasswordToggle?: boolean;

  /**
   * Input mode for mobile keyboards
   */
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /**
   * Blur handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Focus handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * ARIA label
   */
  ariaLabel?: string;

  /**
   * ARIA described by (for error messages)
   */
  ariaDescribedBy?: string;

  /**
   * Additional CSS class
   */
  className?: string;
}
```

---

## States & Behavior

### State Transitions

```
[Empty] ─type→ [Filled] ─focus→ [Focused] ─blur→ [Filled]
   │
   └─error=true→ [Error]
   │
   └─disabled=true→ [Disabled]
```

### Password Toggle Behavior

When `type="password"` and `showPasswordToggle={true}`:
1. Eye icon appears on the right side of input
2. Default state: Password is masked (type="password")
3. Click eye icon → Toggle to show password (type="text")
4. Eye icon changes to "eye-off" icon
5. Click again → Hide password again

**Security**: Password is only revealed while user explicitly shows it

---

## Accessibility Requirements

### ARIA Attributes

```typescript
// Input element
role="textbox"                      // For regular input
aria-label={ariaLabel}              // If no visible label
aria-describedby={ariaDescribedBy}  // Links to helper/error text
aria-invalid={hasError}             // When field has error
aria-required={required}            // When field is required
aria-disabled={disabled}            // When disabled
```

### Keyboard Support

| Key | Action |
|-----|--------|
| `Tab` | Move focus to/from input |
| `Shift+Tab` | Move focus backwards |
| `Escape` | Clear input (optional) |
| Any character | Type in input |

### Screen Reader Announcements

- Empty required field: "Field name, edit text, required, blank"
- Filled field: "Field name, edit text, current value"
- Error field: "Field name, edit text, invalid entry, error message"
- Disabled field: "Field name, edit text, dimmed"

---

## Usage Examples

### Basic Text Input

```tsx
import { Input } from '@/components/atoms/Input';

const [value, setValue] = useState('');

<Input
  type="text"
  value={value}
  onChange={setValue}
  placeholder="Ingresa tu ID"
/>
```

### Password Input with Toggle

```tsx
const [password, setPassword] = useState('');

<Input
  type="password"
  value={password}
  onChange={setPassword}
  placeholder="Contraseña"
  showPasswordToggle
/>
```

### Input with Error State

```tsx
<Input
  type="email"
  value={email}
  onChange={setEmail}
  placeholder="correo@ejemplo.com"
  hasError={!isValidEmail(email)}
  ariaDescribedBy="email-error"
/>
{!isValidEmail(email) && (
  <span id="email-error" style={{ color: '#D8262C' }}>
    Correo inválido
  </span>
)}
```

### Search Input with Icon

```tsx
import { Icon } from '@/components/atoms/Icon';

<Input
  type="search"
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Buscar SKU o presentación"
  startIcon={<Icon name="search" />}
/>
```

### Disabled Input

```tsx
<Input
  type="text"
  value={savedValue}
  onChange={() => {}}
  disabled
  placeholder="No editable"
/>
```

### Input with Character Counter (TextArea)

```tsx
const [nota, setNota] = useState('');
const maxLength = 250;

<div>
  <textarea
    value={nota}
    onChange={(e) => setNota(e.target.value)}
    placeholder="Notas opcionales"
    maxLength={maxLength}
  />
  <span>{nota.length}/{maxLength}</span>
</div>
```

### Input with Auto-complete

```tsx
<Input
  type="text"
  value={username}
  onChange={setUsername}
  placeholder="ID de asesor"
  autoComplete="username"
  name="username"
/>
```

### Numeric Input with Input Mode

```tsx
<Input
  type="text"
  inputMode="numeric"
  value={quantity}
  onChange={setQuantity}
  placeholder="Cantidad"
/>
```

---

## Implementation Notes

### 1. iOS Zoom Prevention

- Use `fontSize: 16px` (minimum) to prevent auto-zoom on iOS
- Never use font-size smaller than 16px for input fields
- This is critical for mobile UX

### 2. Password Toggle Implementation

```tsx
const [showPassword, setShowPassword] = useState(false);
const inputType = type === 'password' && !showPassword ? 'password' : 'text';

return (
  <div style={{ position: 'relative' }}>
    <input type={inputType} {... otherProps} />
    {type === 'password' && showPasswordToggle && (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <Icon name={showPassword ? 'visibility_off' : 'visibility'} />
      </button>
    )}
  </div>
);
```

### 3. Controlled Component Pattern

- Input must be controlled (value + onChange)
- onChange receives the new value as first parameter
- Parent component manages the state

### 4. Error Handling

- `hasError` prop only controls visual state (border color)
- Error message should be separate component
- Link error message with `aria-describedby`

### 5. Mobile Keyboard Optimization

```tsx
// For numeric input - show number keyboard
<Input inputMode="numeric" />

// For phone numbers - show phone keyboard
<Input type="tel" inputMode="tel" />

// For email - show email keyboard with @ symbol
<Input type="email" inputMode="email" />
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('Input', () => {
  it('renders with value', () => {
    render(<Input value="test" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledWith('new value', expect.any(Object));
  });

  it('shows password toggle for password type', () => {
    render(<Input type="password" value="" onChange={() => {}} showPasswordToggle />);
    expect(screen.getByLabelText('Mostrar contraseña')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<Input type="password" value="secret" onChange={() => {}} showPasswordToggle />);

    const input = screen.getByDisplayValue('secret');
    expect(input).toHaveAttribute('type', 'password');

    const toggle = screen.getByLabelText('Mostrar contraseña');
    fireEvent.click(toggle);

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Ocultar contraseña')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input value="" onChange={() => {}} hasError />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input value="" onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('respects maxLength', () => {
    render(<Input value="test" onChange={() => {}} maxLength={5} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '5');
  });
});
```

---

## Acceptance Criteria

- [ ] Text, password, email, and search variants render correctly
- [ ] onChange is called with new value when user types
- [ ] Password toggle shows/hides password correctly
- [ ] Error state displays with red border and aria-invalid
- [ ] Disabled state prevents interaction and shows gray background
- [ ] Focus state shows green border
- [ ] Icons (startIcon, endIcon) display correctly
- [ ] Placeholder text shows when empty
- [ ] MaxLength attribute limits input length
- [ ] Font size is minimum 16px (no iOS zoom)
- [ ] Keyboard navigation works (Tab, Shift+Tab)
- [ ] Screen reader announces field state correctly
- [ ] All unit tests pass

---

## Dependencies

- **Tokens**: `src/styles/tokens.ts` - Colors, typography, spacing
- **Icon**: `src/components/atoms/Icon.tsx` - For password toggle, search icon
- **Types**: `src/types/index.ts` - Common types

---

## References

- Technical Implementation Guide v1.0 - TextField specification
- Material Design 3 - Text fields
- iOS Human Interface Guidelines - Text input
- WCAG 2.1 - Input accessibility

---

**Status**: ✅ Ready for implementation