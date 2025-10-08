/**
 * Real Auth API Client
 *
 * Makes HTTP requests to the backend API server.
 *
 * Features:
 * - Axios-based HTTP client
 * - 30 second timeout
 * - Retry logic for network failures (max 3 attempts)
 * - Exponential backoff
 * - Proper error handling and mapping
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthApiClient,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthError,
  ApiError,
  HTTP_STATUS,
} from './types';
import { logger } from '@/utils/logger';
import { getRetryDelay } from '@/utils/helpers';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/v1';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// ============================================================================
// Axios Instance
// ============================================================================

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Maps HTTP error responses to AuthError
 */
function handleApiError(error: AxiosError<ApiError>): never {
  // Network error (no response from server)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      throw new AuthError('TIMEOUT_ERROR', 'La solicitud ha expirado. Intente nuevamente');
    }
    throw new AuthError('NETWORK_ERROR', 'Error de conexión. Verifique su conexión a internet');
  }

  const status = error.response.status;
  const data = error.response.data;

  // Map HTTP status codes to AuthError
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      throw new AuthError(
        data?.error || 'VALIDATION_ERROR',
        data?.message || 'Datos de entrada inválidos',
        data?.details
      );

    case HTTP_STATUS.UNAUTHORIZED:
      throw new AuthError(
        data?.error || 'INVALID_CREDENTIALS',
        data?.message || 'Credenciales inválidas'
      );

    case HTTP_STATUS.FORBIDDEN:
      throw new AuthError(
        data?.error || 'ACCOUNT_BLOCKED',
        data?.message || 'Cuenta bloqueada. Contacte al administrador'
      );

    case HTTP_STATUS.TOO_MANY_REQUESTS:
      throw new AuthError(
        data?.error || 'RATE_LIMIT_EXCEEDED',
        data?.message || 'Demasiados intentos. Intente nuevamente más tarde',
        data?.details,
        data?.retryAfter
      );

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      throw new AuthError(
        data?.error || 'INTERNAL_ERROR',
        data?.message || 'Error interno del servidor. Intente nuevamente'
      );

    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      throw new AuthError(
        data?.error || 'SERVICE_UNAVAILABLE',
        data?.message || 'Servicio temporalmente no disponible'
      );

    default:
      throw new AuthError(
        'UNKNOWN_ERROR',
        data?.message || 'Error desconocido. Intente nuevamente'
      );
  }
}

/**
 * Retries a request with exponential backoff
 */
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors or validation errors
      if (error instanceof AuthError) {
        const noRetryErrors: string[] = [
          'VALIDATION_ERROR',
          'INVALID_CREDENTIALS',
          'ACCOUNT_BLOCKED',
          'RATE_LIMIT_EXCEEDED',
        ];

        if (noRetryErrors.includes(error.code)) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Wait before retrying (exponential backoff)
      const delay = getRetryDelay(attempt);
      logger.warn(`Request failed, retrying in ${delay}ms`, {
        attempt: attempt + 1,
        maxRetries,
        error: (error as Error).message,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  logger.error('Request failed after all retries', {
    maxRetries,
    error: lastError?.message,
  });
  throw lastError;
}

// ============================================================================
// API Client Implementation
// ============================================================================

export const authApiReal: AuthApiClient = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    logger.info('Login request', { id: request.id });

    return retryRequest(async () => {
      try {
        const response = await axiosInstance.post<LoginResponse>('/auth/login', {
          id: request.id,
          password: request.password,
          rememberMe: request.rememberMe,
        });

        logger.info('Login successful', { id: request.id, rol: response.data.user.rol });
        return response.data;
      } catch (error) {
        logger.error('Login failed', {
          id: request.id,
          error: (error as Error).message,
        });
        throw handleApiError(error as AxiosError<ApiError>);
      }
    });
  },

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    logger.info('Refresh token request');

    return retryRequest(async () => {
      try {
        const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
          refreshToken: request.refreshToken,
        });

        logger.info('Token refreshed successfully');
        return response.data;
      } catch (error) {
        logger.error('Token refresh failed', {
          error: (error as Error).message,
        });
        throw handleApiError(error as AxiosError<ApiError>);
      }
    });
  },
};

// ============================================================================
// Axios Instance Export (for adding interceptors)
// ============================================================================

export { axiosInstance };
