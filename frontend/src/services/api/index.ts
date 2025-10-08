/**
 * API Client Selector
 *
 * Selects between mock and real API client based on feature flag.
 * This allows seamless switching between development (mock) and production (real).
 */

import { AuthApiClient } from './types';
import { authApiMock } from './auth-api-mock';
import { authApiReal } from './auth-api';
import { config } from '@/utils/config';

/**
 * Auth API Client
 *
 * Automatically selects mock or real implementation based on ff_apis_mock flag.
 *
 * - Mock: For development and testing without backend
 * - Real: For production with actual backend API
 */
export const authApi: AuthApiClient = config.featureFlags.ff_apis_mock ? authApiMock : authApiReal;

// Re-export types for convenience
export * from './types';
