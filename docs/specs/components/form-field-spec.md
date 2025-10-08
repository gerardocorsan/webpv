# FormField Component Specification

**Version**: 1.0
**Last Updated**: 2025-09-30
**Status**: Approved
**Type**: Molecule

## Overview

FormField is a wrapper molecule that combines Label + Input + Helper/Error text into a complete form field component. It manages the visual relationship between these elements and handles error states consistently.

**Based on**: Technical Implementation Guide - TextField (complete field) specification

---

## Visual Specifications

### Layout Structure

```
┌─────────────────────────────────┐
│ Label *                         │  ← 12px, #666 (or #D8262C if error)
├─────────────────────────────────┤
│ [Input field]                   │  ← 48px height, Input component
├─────────────────────────────────┤
│ Helper text or error message    │  ← 12px, #666 (or #D8262C if error)
└─────────────────────────────────┘

Total height: ~80px (label + input + helper)
Spacing: 4px between elements
```

### Dimensions

```typescript
gap: 4px                    // Vertical spacing between elements
marginBottom: 16px          // Space between form fields
```

### Typography

```typescript
// Label
fontSize: 14px
fontWeight: 500             // Medium
color: tokens.colors.text.secondary (#666666)
color (error): tokens.colors.semantic.error (#D8262C)
color (focused): tokens.colors.primary.main (#0A7D2B)

// Helper/Error text
fontSize: 12px
fontWeight: 400
color: tokens.colors.text.secondary (#666666)
color (error): tokens.colors.semantic.error (#D8262C)
```

---

## TypeScript Interface

```typescript
export interface FormFieldProps {
  /**
   * Field label text
   */
  label: string;

  /**
   * Whether the field is required
   * Shows asterisk (*) after label
   * @default false
   */
  required?: boolean;

  /**
   * Error message to display
   * When provided, field shows error state
   */
  error?: string;

  /**
   * Helper text to display when no error
   */
  helperText?: string;

  /**
   * All Input component props
   */
  inputProps: InputProps;

  /**
   * Additional CSS class
   */
  className?: string;
}
```

---

## States & Behavior

### Normal State
- Label: Gray color (#666)
- Input: Normal border (#E0E0E0)
- Helper text: Gray color (#666)

### Focused State
- Label: Green color (#0A7D2B)
- Input: Green border (2px #0A7D2B)
- Helper text: Unchanged

### Error State
- Label: Red color (#D8262C)
- Input: Red border (2px #D8262C)
- Error message: Red color (#D8262C), replaces helper text

### Disabled State
- Label: Gray disabled color (#9CA3AF)
- Input: Disabled appearance
- Helper text: Gray disabled color

---

## Usage Examples

### Basic Form Field

```tsx
import { FormField } from '@/components/molecules/FormField';

const [username, setUsername] = useState('');

<FormField
  label="ID de asesor"
  inputProps={{
    type: "text",
    value: username,
    onChange: setUsername,
    placeholder: "A012345"
  }}
/>
```

### Required Field

```tsx
<FormField
  label="Contraseña"
  required
  inputProps={{
    type: "password",
    value: password,
    onChange: setPassword,
    showPasswordToggle: true
  }}
/>
```

### Field with Helper Text

```tsx
<FormField
  label="Correo electrónico"
  helperText="Opcional. Solo para notificaciones."
  inputProps={{
    type: "email",
    value: email,
    onChange: setEmail,
    placeholder: "correo@ejemplo.com"
  }}
/>
```

### Field with Error

```tsx
const [id, setId] = useState('');
const error = id && !isValidId(id) ? 'ID inválido' : '';

<FormField
  label="ID de asesor"
  required
  error={error}
  inputProps={{
    type: "text",
    value: id,
    onChange: setId,
    hasError: !!error,
    ariaDescribedBy: "id-error"
  }}
/>
```

### Complete Form Example

```tsx
function LoginForm() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ id: '', password: '' });

  const handleSubmit = () => {
    const newErrors = {
      id: !id ? 'El ID es requerido' : '',
      password: !password ? 'La contraseña es requerida' : ''
    };
    setErrors(newErrors);

    if (!newErrors.id && !newErrors.password) {
      // Submit form
    }
  };

  return (
    <form>
      <FormField
        label="ID de asesor"
        required
        error={errors.id}
        inputProps={{
          type: "text",
          value: id,
          onChange: setId,
          placeholder: "A012345",
          hasError: !!errors.id,
          autoComplete: "username"
        }}
      />

      <FormField
        label="Contraseña"
        required
        error={errors.password}
        inputProps={{
          type: "password",
          value: password,
          onChange: setPassword,
          hasError: !!errors.password,
          showPasswordToggle: true,
          autoComplete: "current-password"
        }}
      />

      <Button onClick={handleSubmit} fullWidth>
        Entrar
      </Button>
    </form>
  );
}
```

---

## Accessibility Requirements

### ARIA Connections

```typescript
// Automatically generate IDs and connect elements
const fieldId = `field-${generateId()}`;
const errorId = `${fieldId}-error`;
const helperId = `${fieldId}-helper`;

<label htmlFor={fieldId}>
  {label} {required && <span aria-label="requerido">*</span>}
</label>

<Input
  id={fieldId}
  aria-describedby={error ? errorId : helper ? helperId : undefined}
  aria-invalid={!!error}
  aria-required={required}
  {...inputProps}
/>

{error && <span id={errorId} role="alert">{error}</span>}
{!error && helper && <span id={helperId}>{helper}</span>}
```

### Required Indicator

- Visual: Asterisk (*) after label
- Screen reader: "requerido" announced with label
- `aria-required="true"` on input

### Error Announcement

- Error message has `role="alert"` for immediate announcement
- Error message is linked via `aria-describedby`
- Input has `aria-invalid="true"` when error exists

---

## Testing Requirements

```typescript
describe('FormField', () => {
  it('renders label and input', () => {
    render(
      <FormField
        label="Username"
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    render(
      <FormField
        label="Username"
        required
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(
      <FormField
        label="Email"
        helperText="Opcional"
        inputProps={{ type: 'email', value: '', onChange: () => {} }}
      />
    );
    expect(screen.getByText('Opcional')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <FormField
        label="Password"
        error="La contraseña es requerida"
        inputProps={{ type: 'password', value: '', onChange: () => {}, hasError: true }}
      />
    );
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('La contraseña es requerida');
  });

  it('links error message with aria-describedby', () => {
    render(
      <FormField
        label="Username"
        error="Requerido"
        inputProps={{ type: 'text', value: '', onChange: () => {}, hasError: true }}
      />
    );
    const input = screen.getByLabelText('Username');
    const errorId = input.getAttribute('aria-describedby');
    expect(document.getElementById(errorId!)).toHaveTextContent('Requerido');
  });
});
```

---

## Acceptance Criteria

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
- [ ] All unit tests pass

---

## Dependencies

- **Input**: `src/components/atoms/Input.tsx` - Base input component
- **Tokens**: `src/styles/tokens.ts` - Colors, typography, spacing

---

**Status**: ✅ Ready for implementation
