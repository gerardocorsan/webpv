import React from 'react';
import { tokens } from '@/styles/tokens';
import { Icon } from '@/components/atoms/Icon';

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

const variantIcons: Record<string, string> = {
  error: 'error',
  success: 'check_circle',
  warning: 'warning',
  info: 'info',
};

const variantConfig = {
  error: {
    background: tokens.colors.semantic.errorBg,
    text: tokens.colors.semantic.error,
    icon: tokens.colors.semantic.error,
    ariaLive: 'assertive' as const,
  },
  success: {
    background: tokens.colors.semantic.successBg,
    text: tokens.colors.primary.main,
    icon: tokens.colors.primary.main,
    ariaLive: 'polite' as const,
  },
  warning: {
    background: tokens.colors.semantic.warningBg,
    text: tokens.colors.semantic.warning,
    icon: tokens.colors.semantic.warning,
    ariaLive: 'polite' as const,
  },
  info: {
    background: tokens.colors.semantic.infoBg,
    text: tokens.colors.semantic.info,
    icon: tokens.colors.semantic.info,
    ariaLive: 'polite' as const,
  },
};

export function Alert({
  variant,
  children,
  dismissible = false,
  onDismiss,
  showIcon = true,
  icon,
  className = '',
}: AlertProps) {
  const config = variantConfig[variant];

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing['3'],
    minHeight: '48px',
    padding: `${tokens.spacing['3']} ${tokens.spacing['4']}`,
    backgroundColor: config.background,
    borderRadius: tokens.borderRadius.md,
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.regular,
    lineHeight: tokens.typography.lineHeight.normal,
    color: config.text,
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
  };

  const dismissButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    color: config.text,
  };

  const defaultIcon = <Icon name={variantIcons[variant]} color={config.icon} size="sm" />;

  return (
    <div
      role="alert"
      aria-live={config.ariaLive}
      style={containerStyles}
      className={className}
    >
      {showIcon && (
        <div style={iconContainerStyles}>
          {icon || defaultIcon}
        </div>
      )}

      <div style={contentStyles}>{children}</div>

      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar alerta"
          style={dismissButtonStyles}
        >
          <Icon name="close" size="sm" ariaHidden />
        </button>
      )}
    </div>
  );
}
