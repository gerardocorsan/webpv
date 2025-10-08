/**
 * Authentication Service
 *
 * Manages user authentication, session persistence, and token management.
 * This is the main authentication service used by the UI layer.
 *
 * Features:
 * - Login with credential validation
 * - Session persistence in IndexedDB
 * - Token management (JWT + refresh token)
 * - Automatic token refresh
 * - Offline session restore
 * - Logout
 */

import { authApi, LoginRequest, LoginResponse, User, AuthError } from '@/services/api';
import { initDB } from '@/services/db';
import { axiosInstance } from '@/services/api/auth-api';
import { logger } from '@/utils/logger';
import { isOnline } from '@/utils/helpers';

// ============================================================================
// Types
// ============================================================================

interface Session {
  token: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  user: User;
  rememberMe: boolean;
}

const SESSION_KEY = 'auth_session';

// ============================================================================
// Session Management
// ============================================================================

/**
 * Saves session to IndexedDB
 */
async function saveSession(session: Session): Promise<void> {
  try {
    const db = await initDB();
    await db.put('Configuracion', {
      clave: SESSION_KEY,
      valor: session,
      actualizadoEn: new Date().toISOString(),
    });
    logger.info('Session saved to IndexedDB');
  } catch (error) {
    logger.error('Failed to save session', { error: (error as Error).message });
    throw new Error('Failed to save session');
  }
}

/**
 * Loads session from IndexedDB
 */
async function loadSession(): Promise<Session | null> {
  try {
    const db = await initDB();
    const config = await db.get('Configuracion', SESSION_KEY);

    if (!config || !config.valor) {
      return null;
    }

    return config.valor as Session;
  } catch (error) {
    logger.error('Failed to load session', { error: (error as Error).message });
    return null;
  }
}

/**
 * Clears session from IndexedDB
 */
async function clearSession(): Promise<void> {
  try {
    const db = await initDB();
    await db.delete('Configuracion', SESSION_KEY);
    logger.info('Session cleared from IndexedDB');
  } catch (error) {
    logger.error('Failed to clear session', { error: (error as Error).message });
  }
}

/**
 * Checks if session is expired
 */
function isSessionExpired(session: Session): boolean {
  const now = Date.now();
  return now >= session.expiresAt;
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Configures axios to include auth token in requests
 */
function setAuthToken(token: string): void {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Removes auth token from axios
 */
function clearAuthToken(): void {
  delete axiosInstance.defaults.headers.common['Authorization'];
}

// ============================================================================
// Auth Service
// ============================================================================

class AuthService {
  private currentSession: Session | null = null;

  /**
   * Login with credentials
   *
   * @param id - User ID
   * @param password - User password
   * @param rememberMe - Whether to persist session for offline use
   * @returns User object
   * @throws AuthError if login fails
   */
  async login(id: string, password: string, rememberMe: boolean = true): Promise<User> {
    logger.info('Login attempt', { id, rememberMe });

    // Client-side validation
    if (!id || id.trim() === '') {
      throw new AuthError('VALIDATION_ERROR', 'El ID es requerido', { id: 'El ID es requerido' });
    }

    if (!password || password.trim() === '') {
      throw new AuthError(
        'VALIDATION_ERROR',
        'La contraseña es requerida',
        { password: 'La contraseña es requerida' }
      );
    }

    // Additional validation: ID format (alphanumeric, 6-10 characters)
    if (!/^[A-Za-z0-9]{6,10}$/.test(id)) {
      throw new AuthError(
        'VALIDATION_ERROR',
        'El ID debe tener entre 6 y 10 caracteres alfanuméricos',
        { id: 'Formato de ID inválido' }
      );
    }

    try {
      // Call API
      const request: LoginRequest = { id, password, rememberMe };
      const response: LoginResponse = await authApi.login(request);

      // Calculate token expiration (add buffer of 60 seconds)
      const expiresAt = Date.now() + (response.expiresIn - 60) * 1000;

      // Create session
      const session: Session = {
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt,
        user: response.user,
        rememberMe,
      };

      // Save session
      this.currentSession = session;
      setAuthToken(session.token);

      if (rememberMe) {
        await saveSession(session);
      }

      logger.info('Login successful', {
        userId: response.user.id,
        rol: response.user.rol,
        rememberMe,
      });

      return response.user;
    } catch (error) {
      logger.error('Login failed', { id, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Logout user
   *
   * Clears session from memory and IndexedDB
   */
  async logout(): Promise<void> {
    logger.info('Logout');

    this.currentSession = null;
    clearAuthToken();
    await clearSession();

    logger.info('Logout successful');
  }

  /**
   * Restore session from IndexedDB (for offline mode or page refresh)
   *
   * @returns User object if session is valid, null otherwise
   */
  async restoreSession(): Promise<User | null> {
    logger.info('Attempting to restore session');

    try {
      const session = await loadSession();

      if (!session) {
        logger.info('No session found');
        return null;
      }

      // Check if session is expired
      if (isSessionExpired(session) && isOnline()) {
        logger.info('Session expired, attempting refresh');

        try {
          // Set session temporarily so refreshToken() can access it
          this.currentSession = session;
          setAuthToken(session.token);

          // Try to refresh token
          await this.refreshToken();
          return this.currentSession?.user || null;
        } catch (error) {
          logger.warn('Token refresh failed', { error: (error as Error).message });
          await this.logout();
          return null;
        }
      }

      // Session is valid (or we're offline and it hasn't expired too long)
      this.currentSession = session;
      setAuthToken(session.token);

      logger.info('Session restored', {
        userId: session.user.id,
        expired: isSessionExpired(session),
        offline: !isOnline(),
      });

      return session.user;
    } catch (error) {
      logger.error('Failed to restore session', { error: (error as Error).message });
      return null;
    }
  }

  /**
   * Refresh authentication token
   *
   * @throws AuthError if refresh fails
   */
  async refreshToken(): Promise<void> {
    logger.info('Refreshing token');

    if (!this.currentSession) {
      throw new AuthError('INVALID_CREDENTIALS', 'No hay sesión activa para refrescar');
    }

    if (!this.currentSession.refreshToken) {
      throw new AuthError('INVALID_CREDENTIALS', 'No hay token de actualización disponible');
    }

    try {
      const response = await authApi.refreshToken({
        refreshToken: this.currentSession.refreshToken,
      });

      // Update session with new token
      const expiresAt = Date.now() + (response.expiresIn - 60) * 1000;
      this.currentSession = {
        ...this.currentSession,
        token: response.token,
        expiresAt,
      };

      setAuthToken(this.currentSession.token);

      if (this.currentSession.rememberMe) {
        await saveSession(this.currentSession);
      }

      logger.info('Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh failed', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   *
   * @returns true if user has valid session
   */
  isAuthenticated(): boolean {
    if (!this.currentSession) {
      return false;
    }

    // If offline, allow expired sessions (user can still access cached data)
    if (!isOnline()) {
      return true;
    }

    // If online, check expiration
    return !isSessionExpired(this.currentSession);
  }

  /**
   * Get current user
   *
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  /**
   * Get current token
   *
   * @returns Current token or null if not authenticated
   */
  getCurrentToken(): string | null {
    return this.currentSession?.token || null;
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const authService = new AuthService();
