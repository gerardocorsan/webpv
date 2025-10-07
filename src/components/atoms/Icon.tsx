import React from 'react';
import { tokens } from '@/styles/tokens';

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
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | 'white'
    | 'gray'
    | 'black'
    | 'inherit'
    | string;

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

  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

const sizeMap = {
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
};

const colorMap: Record<string, string> = {
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
  style,
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
          ...style,
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
        ...style,
      }}
    >
      {name}
    </span>
  );
}
