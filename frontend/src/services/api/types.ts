/**
 * API Types and Interfaces
 *
 * Based on TECHNICAL-SPECS.md API Contracts
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  id: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: string;
  nombre: string;
  rol: 'asesor' | 'supervisor' | 'admin';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// ============================================================================
// Error Types
// ============================================================================

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_BLOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiError {
  error: ApiErrorCode;
  message: string;
  details?: Record<string, string>;
  retryAfter?: number;
}

export class AuthError extends Error {
  constructor(
    public code: ApiErrorCode,
    public userMessage: string,
    public details?: Record<string, string>,
    public retryAfter?: number
  ) {
    super(userMessage);
    this.name = 'AuthError';
  }
}

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// API Client Interface
// ============================================================================

export interface AuthApiClient {
  login(request: LoginRequest): Promise<LoginResponse>;
  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse>;
}
