import type { AppConfig, FeatureFlags } from '@/types';

// Load configuration from environment variables
export const config: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/v1',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  environment: (import.meta.env.VITE_ENVIRONMENT as AppConfig['environment']) || 'development',
  version: '0.1.0',
  featureFlags: {
    ff_inteligencia_competencia: import.meta.env.VITE_FF_INTELIGENCIA_COMPETENCIA === 'true',
    ff_geo_validacion: import.meta.env.VITE_FF_GEO_VALIDACION !== 'false',
    ff_geo_validacion_precision_minima:
      Number(import.meta.env.VITE_FF_GEO_PRECISION_MINIMA) || 50,
    ff_apis_mock: import.meta.env.VITE_FF_APIS_MOCK === 'true',
    ff_background_sync: import.meta.env.VITE_FF_BACKGROUND_SYNC !== 'false',
    ff_offline_mode: import.meta.env.VITE_FF_OFFLINE_MODE !== 'false',
  },
};

// Feature flag evaluation
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  // Check for localStorage override in development
  if (import.meta.env.DEV) {
    const override = localStorage.getItem(`flag:${flag}`);
    if (override !== null) {
      return override === 'true';
    }
  }

  return config.featureFlags[flag] as boolean;
}

// Get feature flag value (for numeric flags)
export function getFeatureFlagValue<T>(flag: keyof FeatureFlags): T {
  // Check for localStorage override in development
  if (import.meta.env.DEV) {
    const override = localStorage.getItem(`flag:${flag}`);
    if (override !== null) {
      try {
        return JSON.parse(override) as T;
      } catch {
        return override as T;
      }
    }
  }

  return config.featureFlags[flag] as T;
}
