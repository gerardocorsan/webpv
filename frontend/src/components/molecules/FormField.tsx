import React, { useState, useId } from 'react';
import { tokens } from '@/styles/tokens';
import { Input, InputProps } from '@/components/atoms/Input';

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

export function FormField({
  label,
  required = false,
  error,
  helperText,
  inputProps,
  className = '',
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  // Determine label color based on state
  const labelColor = error
    ? tokens.colors.semantic.error
    : isFocused
    ? tokens.colors.primary.main
    : inputProps.disabled
    ? tokens.colors.text.disabled
    : tokens.colors.text.secondary;

  // Determine helper/error text color
  const helperColor = error
    ? tokens.colors.semantic.error
    : inputProps.disabled
    ? tokens.colors.text.disabled
    : tokens.colors.text.secondary;

  // Enhance input props with form field specific attributes
  const enhancedInputProps: InputProps = {
    ...inputProps,
    id: fieldId,
    hasError: !!error || inputProps.hasError,
    required,
    ariaDescribedBy: error ? errorId : helperText ? helperId : inputProps.ariaDescribedBy,
    onFocus: (event) => {
      setIsFocused(true);
      inputProps.onFocus?.(event);
    },
    onBlur: (event) => {
      setIsFocused(false);
      inputProps.onBlur?.(event);
    },
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing['1'],
    marginBottom: tokens.spacing['4'],
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: labelColor,
    transition: `color ${tokens.animation.duration.fast} ${tokens.animation.easing.standard}`,
  };

  const requiredIndicatorStyles: React.CSSProperties = {
    color: tokens.colors.semantic.error,
    marginLeft: tokens.spacing['1'],
  };

  const helperTextStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.regular,
    color: helperColor,
    margin: 0,
  };

  const showHelperText = !error && helperText;

  return (
    <div style={containerStyles} className={className}>
      <label htmlFor={fieldId} style={labelStyles}>
        {label}
        {required && (
          <span style={requiredIndicatorStyles} aria-label="requerido">
            *
          </span>
        )}
      </label>

      <Input {...enhancedInputProps} />

      {error && (
        <span id={errorId} role="alert" style={helperTextStyles}>
          {error}
        </span>
      )}

      {showHelperText && (
        <span id={helperId} style={helperTextStyles}>
          {helperText}
        </span>
      )}
    </div>
  );
}
