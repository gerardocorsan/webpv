/**
 * Design Tokens
 *
 * Foundational visual design atoms of the design system.
 * Defines colors, typography, spacing, and other visual properties.
 *
 * Based on: Technical Implementation Guide v1.0 and Material Design 3
 */

export const tokens = {
  colors: {
    primary: {
      main: '#0A7D2B',        // Green - Primary actions, buttons, focus states
      light: '#10B981',       // Light green - Success states
      dark: '#065F21',        // Dark green - Hover states
    },

    semantic: {
      error: '#D8262C',       // Red - Errors, validation failures
      errorBg: '#FEE2E2',     // Light red - Error alert backgrounds

      warning: '#F59E0B',     // Orange/Yellow - Warnings
      warningBg: '#FEF3C7',   // Light yellow - Warning alert backgrounds

      info: '#2196F3',        // Blue - Offline state, informational
      infoBg: '#DBEAFE',      // Light blue - Info alert backgrounds

      success: '#4CAF50',     // Green - Success confirmations
      successBg: '#D1FAE5',   // Light green - Success alert backgrounds
    },

    neutral: {
      white: '#FFFFFF',
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray300: '#D1D5DB',
      gray400: '#9CA3AF',
      gray500: '#6B7280',
      gray600: '#4B5563',
      gray700: '#374151',
      gray800: '#1F2937',
      gray900: '#111827',
      black: '#000000',
    },

    text: {
      primary: '#333333',     // Main text color
      secondary: '#666666',   // Secondary text, descriptions
      disabled: '#9CA3AF',    // Disabled text
      white: '#FFFFFF',       // Text on dark backgrounds
      error: '#D8262C',       // Error messages
    },

    background: {
      primary: '#FFFFFF',     // Main background
      secondary: '#F5F5F5',   // Secondary background, cards
      tertiary: '#F9FAFB',    // Subtle backgrounds
    },

    border: {
      default: '#E0E0E0',     // Default borders
      focus: '#0A7D2B',       // Focused input borders
      error: '#D8262C',       // Error state borders
    },
  },

  typography: {
    fontFamily: {
      primary: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    fontSize: {
      xs: '12px',            // 12px - Captions, helper text
      sm: '14px',            // 14px - Body text, secondary info
      base: '16px',          // 16px - Primary body text, inputs
      lg: '18px',            // 18px - Large body text
      xl: '20px',            // 20px - Subtitles, section headers
      '2xl': '22px',         // 22px - Page titles
      '3xl': '24px',         // 24px - Main titles
    },

    fontWeight: {
      regular: 400,          // Normal text
      medium: 500,           // Emphasized text, buttons
      bold: 700,             // Headings, strong emphasis
    },

    lineHeight: {
      tight: 1.2,            // Headings
      normal: 1.5,           // Body text
      relaxed: 1.75,         // Loose text
    },
  },

  spacing: {
    '0': '0',
    '1': '4px',     // 4px - 0.25rem - xs
    '2': '8px',     // 8px - 0.5rem - sm
    '3': '12px',    // 12px - 0.75rem - md
    '4': '16px',    // 16px - 1rem - lg
    '6': '24px',    // 24px - 1.5rem - xl
    '8': '32px',    // 32px - 2rem - 2xl
    '12': '48px',   // 48px - 3rem - 3xl
    '16': '64px',   // 64px - 4rem - 4xl
  },

  borderRadius: {
    none: '0',
    sm: '4px',              // Small radius - chips, tags
    md: '8px',              // Cards, list items
    lg: '12px',             // Buttons, inputs
    xl: '16px',             // Extra large radius
    full: '9999px',         // Circular - avatars, pills
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',                // Level 1
    md: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',              // Level 2
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',              // Level 3
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',            // Level 4
  },

  touchTargets: {
    minimum: '44px',        // iOS minimum
    recommended: '48px',    // Android minimum (48dp)
  },

  componentSizes: {
    button: {
      height: '48px',       // Standard button height
      minWidth: '64px',     // Minimum button width
    },
    input: {
      height: '56px',       // TextField total height
    },
    icon: {
      sm: '16px',
      md: '24px',           // Standard icon size
      lg: '32px',
      xl: '48px',
    },
    avatar: {
      sm: '32px',
      md: '40px',           // Standard avatar in lists
      lg: '56px',
    },
    chip: {
      height: '32px',
    },
    banner: {
      height: '48px',       // Offline banner, alerts
    },
  },

  animation: {
    duration: {
      fast: '150ms',        // Quick transitions
      normal: '250ms',      // Standard transitions
      slow: '400ms',        // Slow, emphasized transitions
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',     // Material standard
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',   // Deceleration
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',     // Acceleration
    },
  },

  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type Tokens = typeof tokens;
