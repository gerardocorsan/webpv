import React from 'react';
import { tokens } from '@/styles/tokens';
import { Icon } from './Icon';

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

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  className = '',
  startIcon,
  endIcon,
  ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  // Base styles
  const baseStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontWeight: tokens.typography.fontWeight.medium,
    letterSpacing: '0.5px',
    textTransform: 'none',
    border: 'none',
    cursor: isDisabled ? (loading ? 'wait' : 'not-allowed') : 'pointer',
    transition: `all ${tokens.animation.duration.fast} ${tokens.animation.easing.standard}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing['2'],
    width: fullWidth ? '100%' : 'auto',
    boxSizing: 'border-box',
  };

  // Size-specific styles
  const sizeStyles: React.CSSProperties =
    size === 'small'
      ? {
          height: '36px',
          minHeight: '48px', // Touch target compliance
          minWidth: '48px',
          padding: `8px ${tokens.spacing['3']}`,
          fontSize: tokens.typography.fontSize.sm,
          borderRadius: tokens.borderRadius.md,
        }
      : {
          height: '48px',
          minWidth: '64px',
          padding: `12px ${tokens.spacing['4']}`,
          fontSize: tokens.typography.fontSize.base,
          borderRadius: tokens.borderRadius.lg,
        };

  // Variant-specific styles
  const variantStyles: React.CSSProperties =
    variant === 'primary'
      ? {
          backgroundColor: tokens.colors.primary.main,
          color: tokens.colors.text.white,
          boxShadow: tokens.shadows.sm,
          ...(isDisabled && {
            backgroundColor: 'rgba(10, 125, 43, 0.38)',
            color: 'rgba(255, 255, 255, 0.60)',
            boxShadow: 'none',
            opacity: loading ? 0.8 : 1,
          }),
        }
      : {
          backgroundColor: tokens.colors.background.primary,
          color: tokens.colors.primary.main,
          border: `1px solid ${tokens.colors.primary.main}`,
          boxShadow: 'none',
          ...(isDisabled && {
            backgroundColor: tokens.colors.background.primary,
            color: tokens.colors.text.disabled,
            border: `1px solid ${tokens.colors.border.default}`,
            opacity: loading ? 0.8 : 1,
          }),
        };

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles,
    ...variantStyles,
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      style={combinedStyles}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-busy={loading}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        const target = e.currentTarget;
        if (variant === 'primary') {
          target.style.backgroundColor = tokens.colors.primary.dark;
          target.style.boxShadow = tokens.shadows.md;
        } else {
          target.style.backgroundColor = 'rgba(10, 125, 43, 0.04)';
          target.style.borderColor = tokens.colors.primary.dark;
          target.style.boxShadow = tokens.shadows.sm;
        }
      }}
      onMouseLeave={(e) => {
        if (isDisabled) return;
        const target = e.currentTarget;
        if (variant === 'primary') {
          target.style.backgroundColor = tokens.colors.primary.main;
          target.style.boxShadow = tokens.shadows.sm;
        } else {
          target.style.backgroundColor = tokens.colors.background.primary;
          target.style.borderColor = tokens.colors.primary.main;
          target.style.boxShadow = 'none';
        }
      }}
      onMouseDown={(e) => {
        if (isDisabled) return;
        const target = e.currentTarget;
        target.style.transform = 'translateY(1px)';
        if (variant === 'primary') {
          target.style.boxShadow = 'none';
        } else {
          target.style.backgroundColor = 'rgba(10, 125, 43, 0.08)';
        }
      }}
      onMouseUp={(e) => {
        if (isDisabled) return;
        const target = e.currentTarget;
        target.style.transform = 'translateY(0)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${tokens.colors.border.focus}`;
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      {loading && (
        <Icon
          name="sync"
          size="sm"
          ariaHidden
          className="button-spinner"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {!loading && startIcon && startIcon}
      {children}
      {!loading && endIcon && endIcon}
    </button>
  );
}
