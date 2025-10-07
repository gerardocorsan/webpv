import React, { useState } from 'react';
import { tokens } from '@/styles/tokens';
import { Icon } from './Icon';

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

  /**
   * Input id attribute (for label association)
   */
  id?: string;
}

export function Input({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  hasError = false,
  disabled = false,
  required = false,
  readOnly = false,
  autoFocus = false,
  autoComplete = 'off',
  maxLength,
  startIcon,
  endIcon,
  showPasswordToggle = true,
  inputMode,
  onBlur,
  onFocus,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  id,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine actual input type (for password toggle)
  const actualType = type === 'password' && showPassword ? 'text' : type;

  // Show password toggle button
  const shouldShowPasswordToggle = type === 'password' && showPasswordToggle;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value, event);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
  };

  // Input wrapper styles
  const wrapperStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    backgroundColor: disabled
      ? tokens.colors.neutral.gray100
      : tokens.colors.background.primary,
    border: hasError
      ? `2px solid ${tokens.colors.border.error}`
      : isFocused
      ? `2px solid ${tokens.colors.border.focus}`
      : `1px solid ${tokens.colors.border.default}`,
    borderRadius: tokens.borderRadius.md,
    padding: hasError || isFocused ? '11px' : tokens.spacing['3'], // Adjust for 2px border
    transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.standard}`,
  };

  // Input styles
  const inputStyles: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize.base, // Minimum 16px to prevent iOS zoom
    fontWeight: tokens.typography.fontWeight.regular,
    color: disabled ? tokens.colors.text.disabled : tokens.colors.text.primary,
    cursor: disabled ? 'not-allowed' : 'text',
    minWidth: 0, // Allow input to shrink in flex container
  };

  // Icon container styles
  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing['2'],
  };

  return (
    <div style={containerStyles} className={className}>
      <div style={wrapperStyles}>
        {startIcon && (
          <div style={{ ...iconContainerStyles, marginRight: tokens.spacing['2'] }}>
            {startIcon}
          </div>
        )}

        <input
          type={actualType}
          id={id}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          inputMode={inputMode}
          style={inputStyles}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasError}
          aria-required={required}
          aria-disabled={disabled}
        />

        {shouldShowPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              marginLeft: tokens.spacing['2'],
            }}
            tabIndex={-1}
          >
            <Icon
              name={showPassword ? 'visibility_off' : 'visibility'}
              size="sm"
              color="secondary"
              ariaHidden
            />
          </button>
        )}

        {!shouldShowPasswordToggle && endIcon && (
          <div style={{ ...iconContainerStyles, marginLeft: tokens.spacing['2'] }}>
            {endIcon}
          </div>
        )}
      </div>
    </div>
  );
}
