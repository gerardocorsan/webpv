/**
 * Mock Auth API Client
 *
 * Simulates realistic API behavior for development and testing
 * without requiring a backend server.
 *
 * Features:
 * - Realistic network latency (300-800ms)
 * - All error codes (400, 401, 403, 429, 500, 503)
 * - Rate limiting simulation
 * - Random timeouts (5% probability)
 * - Account lockout after failed attempts
 */

import {
  AuthApiClient,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthError,
} from './types';
import { logger } from '@/utils/logger';

// ============================================================================
// Mock Database
// ============================================================================

const MOCK_USERS = {
  A012345: {
    id: 'A012345',
    password: 'demo123',
    nombre: 'Juan Pérez',
    rol: 'asesor' as const,
  },
  A067890: {
    id: 'A067890',
    password: 'test456',
    nombre: 'María González',
    rol: 'supervisor' as const,
  },
} as const;

const BLOCKED_ACCOUNTS = new Set<string>(['A099999']);

// Rate limiting: Track login attempts per user
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Account lockout: Track locked accounts
const lockedAccounts = new Map<string, number>(); // userId -> unlock timestamp

// Mock refresh tokens
const validRefreshTokens = new Set<string>();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simulates network latency
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates realistic network latency (300-800ms)
 */
async function simulateNetworkLatency(): Promise<void> {
  const latency = Math.random() * 500 + 300; // 300-800ms
  await delay(latency);
}

/**
 * Randomly simulates network timeout (5% probability)
 */
function simulateRandomTimeout(): void {
  if (Math.random() < 0.05) {
    throw new AuthError('TIMEOUT_ERROR', 'La solicitud ha expirado. Intente nuevamente');
  }
}

/**
 * Checks if account is locked due to too many failed attempts
 */
function isAccountLocked(userId: string): boolean {
  const unlockTime = lockedAccounts.get(userId);
  if (!unlockTime) return false;

  const now = Date.now();
  if (now < unlockTime) {
    return true;
  }

  // Unlock expired, remove from locked accounts
  lockedAccounts.delete(userId);
  return false;
}

/**
 * Records a failed login attempt and locks account if necessary
 */
function recordFailedAttempt(userId: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(userId);

  if (!attempt) {
    loginAttempts.set(userId, { count: 1, lastAttempt: now });
    return;
  }

  // Reset counter if last attempt was more than 15 minutes ago
  const fifteenMinutes = 15 * 60 * 1000;
  if (now - attempt.lastAttempt > fifteenMinutes) {
    loginAttempts.set(userId, { count: 1, lastAttempt: now });
    return;
  }

  // Increment attempt count
  const newCount = attempt.count + 1;
  loginAttempts.set(userId, { count: newCount, lastAttempt: now });

  // Lock account after 5 failed attempts
  if (newCount >= 5) {
    const thirtyMinutes = 30 * 60 * 1000;
    lockedAccounts.set(userId, now + thirtyMinutes);
    logger.warn('Account locked due to too many failed attempts', { userId });
  }
}

/**
 * Clears failed login attempts for a user
 */
function clearFailedAttempts(userId: string): void {
  loginAttempts.delete(userId);
}

/**
 * Checks rate limiting (5 attempts per minute)
 */
function checkRateLimit(userId: string): void {
  const attempt = loginAttempts.get(userId);
  if (!attempt) return;

  const oneMinute = 60 * 1000;
  const now = Date.now();

  if (now - attempt.lastAttempt < oneMinute && attempt.count >= 5) {
    throw new AuthError(
      'RATE_LIMIT_EXCEEDED',
      'Demasiados intentos. Intente nuevamente en 1 minuto',
      undefined,
      60 // retry after 60 seconds
    );
  }
}

/**
 * Generates a mock JWT token
 */
function generateMockToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  );
  const signature = btoa(`mock-signature-${userId}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Generates a mock refresh token
 */
function generateMockRefreshToken(): string {
  const token = `refresh-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  validRefreshTokens.add(token);
  return token;
}

// ============================================================================
// Mock API Client Implementation
// ============================================================================

export const authApiMock: AuthApiClient = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    logger.info('[MOCK] Login attempt', { id: request.id });

    // Simulate network latency
    await simulateNetworkLatency();

    // Simulate random timeout
    simulateRandomTimeout();

    // Validate request
    if (!request.id || !request.password) {
      throw new AuthError(
        'VALIDATION_ERROR',
        'Datos de entrada inválidos',
        {
          id: !request.id ? 'El ID es requerido' : '',
          password: !request.password ? 'La contraseña es requerida' : '',
        }
      );
    }

    // Check rate limiting
    checkRateLimit(request.id);

    // Check if account is locked
    if (isAccountLocked(request.id)) {
      throw new AuthError(
        'ACCOUNT_BLOCKED',
        'Cuenta bloqueada temporalmente. Intente nuevamente en 30 minutos'
      );
    }

    // Check if account is blocked
    if (BLOCKED_ACCOUNTS.has(request.id)) {
      throw new AuthError('ACCOUNT_BLOCKED', 'Cuenta bloqueada. Contacte al administrador');
    }

    // Find user
    const user = MOCK_USERS[request.id as keyof typeof MOCK_USERS];

    if (!user || user.password !== request.password) {
      recordFailedAttempt(request.id);
      throw new AuthError('INVALID_CREDENTIALS', 'Credenciales inválidas');
    }

    // Successful login - clear failed attempts
    clearFailedAttempts(request.id);

    // Generate tokens
    const token = generateMockToken(user.id);
    const refreshToken = generateMockRefreshToken();

    logger.info('[MOCK] Login successful', { id: user.id, rol: user.rol });

    return {
      token,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
      },
    };
  },

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    logger.info('[MOCK] Refresh token attempt');

    // Simulate network latency
    await simulateNetworkLatency();

    // Simulate random timeout
    simulateRandomTimeout();

    // Validate refresh token
    if (!request.refreshToken || !validRefreshTokens.has(request.refreshToken)) {
      throw new AuthError('INVALID_CREDENTIALS', 'Token de actualización inválido');
    }

    // Generate new token
    const token = generateMockToken('mock-user');

    logger.info('[MOCK] Token refreshed successfully');

    return {
      token,
      expiresIn: 3600,
    };
  },
};

// ============================================================================
// Mock Utilities (for testing)
// ============================================================================

/**
 * Reset mock state (useful for testing)
 */
export function resetMockState(): void {
  loginAttempts.clear();
  lockedAccounts.clear();
  validRefreshTokens.clear();
  logger.info('[MOCK] State reset');
}

/**
 * Simulate service unavailability
 */
export function simulateServiceUnavailable(enable: boolean): void {
  if (enable) {
    authApiMock.login = async () => {
      await simulateNetworkLatency();
      throw new AuthError('SERVICE_UNAVAILABLE', 'Servicio temporalmente no disponible');
    };
  }
}

/**
 * Get mock credentials for testing
 */
export const MOCK_CREDENTIALS = {
  valid: { id: 'A012345', password: 'demo123' },
  invalidPassword: { id: 'A012345', password: 'wrong' },
  invalidUser: { id: 'INVALID', password: 'test' },
  blocked: { id: 'A099999', password: 'test' },
  supervisor: { id: 'A067890', password: 'test456' },
} as const;
