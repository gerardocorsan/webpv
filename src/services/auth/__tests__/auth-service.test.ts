import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { authService } from '../auth-service';
import { authApi } from '@/services/api';
import { AuthError } from '@/services/api/types';
import { initDB } from '@/services/db';
import * as helpers from '@/utils/helpers';

// Mock only the API layer (not IndexedDB)
vi.mock('@/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api')>();
  return {
    ...actual,
    authApi: {
      login: vi.fn(),
      refreshToken: vi.fn(),
    },
  };
});

describe('AuthService', () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset auth service state
    authService['currentSession'] = null;

    // Clear IndexedDB
    const db = await initDB();
    await db.clear('Configuracion');
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const user = await authService.login('A012345', 'demo123', true);

      expect(user).toEqual(mockResponse.user);
      expect(authApi.login).toHaveBeenCalledWith({
        id: 'A012345',
        password: 'demo123',
        rememberMe: true,
      });

      // Verify session was saved to IndexedDB
      const db = await initDB();
      const config = await db.get('Configuracion', 'auth_session');
      expect(config).toBeDefined();
      expect(config?.valor.user).toEqual(mockResponse.user);
      expect(config?.valor.token).toBe('mock-token');
    });

    it('should validate ID format', async () => {
      await expect(authService.login('invalid@#', 'password')).rejects.toThrow(AuthError);
      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('should validate ID length (too short)', async () => {
      await expect(authService.login('A123', 'password')).rejects.toThrow(AuthError);
      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('should validate ID length (too long)', async () => {
      await expect(authService.login('A12345678901', 'password')).rejects.toThrow(AuthError);
      expect(authApi.login).not.toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      const mockError = new AuthError('INVALID_CREDENTIALS', 'Credenciales inválidas');
      (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(authService.login('A012345', 'wrong-password')).rejects.toThrow(mockError);

      // Verify session was NOT saved
      const db = await initDB();
      const config = await db.get('Configuracion', 'auth_session');
      expect(config).toBeUndefined();
    });

    it('should not save session to IndexedDB when rememberMe is false', async () => {
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      await authService.login('A012345', 'demo123', false);

      // Verify session was NOT saved to IndexedDB
      const db = await initDB();
      const config = await db.get('Configuracion', 'auth_session');
      expect(config).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should clear session and token', async () => {
      // Setup: login first
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
      await authService.login('A012345', 'demo123', true);

      // Verify session exists
      let db = await initDB();
      let config = await db.get('Configuracion', 'auth_session');
      expect(config).toBeDefined();

      // Test logout
      await authService.logout();

      // Verify session was cleared
      db = await initDB();
      config = await db.get('Configuracion', 'auth_session');
      expect(config).toBeUndefined();

      expect(authService.getCurrentUser()).toBeNull();
      expect(authService.getCurrentToken()).toBeNull();
    });
  });

  describe('restoreSession', () => {
    it('should restore valid session from IndexedDB', async () => {
      // Setup: login first
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
      await authService.login('A012345', 'demo123', true);

      // Clear in-memory session
      authService['currentSession'] = null;

      // Restore from IndexedDB
      const user = await authService.restoreSession();

      expect(user).toEqual(mockResponse.user);
      expect(authService.getCurrentUser()).toEqual(mockResponse.user);
      expect(authService.getCurrentToken()).toBe('mock-token');
    });

    it('should return null when no session exists', async () => {
      const user = await authService.restoreSession();
      expect(user).toBeNull();
    });

    it('should refresh expired session when online', async () => {
      // Setup: Create expired session in IndexedDB
      const db = await initDB();
      await db.put('Configuracion', {
        clave: 'auth_session',
        valor: {
          token: 'old-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() - 1000, // Expired
          user: {
            id: 'A012345',
            nombre: 'Juan Pérez',
            rol: 'asesor',
          },
          rememberMe: true,
        },
        actualizadoEn: new Date().toISOString(),
      });

      const mockRefreshResponse = {
        token: 'new-token',
        expiresIn: 3600,
      };

      (authApi.refreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockRefreshResponse);

      // Mock isOnline to return true
      vi.spyOn(helpers, 'isOnline').mockReturnValue(true);

      const user = await authService.restoreSession();

      expect(user).toBeDefined();
      expect(authApi.refreshToken).toHaveBeenCalledWith({
        refreshToken: 'mock-refresh-token',
      });
      expect(authService.getCurrentToken()).toBe('new-token');
    });

    it('should accept expired session when offline', async () => {
      // Setup: Create expired session in IndexedDB
      const db = await initDB();
      const expiredSession = {
        token: 'old-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: Date.now() - 1000, // Expired
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
        rememberMe: true,
      };

      await db.put('Configuracion', {
        clave: 'auth_session',
        valor: expiredSession,
        actualizadoEn: new Date().toISOString(),
      });

      // Mock isOnline to return false (offline)
      vi.spyOn(helpers, 'isOnline').mockReturnValue(false);

      const user = await authService.restoreSession();

      expect(user).toEqual(expiredSession.user);
      expect(authApi.refreshToken).not.toHaveBeenCalled();
      expect(authService.getCurrentToken()).toBe('old-token'); // Old token still used
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Setup: login first
      const mockLoginResponse = {
        token: 'old-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
      };

      const mockRefreshResponse = {
        token: 'new-token',
        expiresIn: 3600,
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockLoginResponse);
      (authApi.refreshToken as ReturnType<typeof vi.fn>).mockResolvedValue(mockRefreshResponse);

      await authService.login('A012345', 'demo123', true);

      // Test refresh
      await authService.refreshToken();

      expect(authApi.refreshToken).toHaveBeenCalledWith({
        refreshToken: mockLoginResponse.refreshToken,
      });
      expect(authService.getCurrentToken()).toBe('new-token');

      // Verify updated token in IndexedDB
      const db = await initDB();
      const config = await db.get('Configuracion', 'auth_session');
      expect(config?.valor.token).toBe('new-token');
    });

    it('should throw error when no session exists', async () => {
      await expect(authService.refreshToken()).rejects.toThrow(
        'No hay sesión activa para refrescar'
      );
    });

    it('should throw error when no refresh token exists', async () => {
      // Manually set a session without refresh token
      authService['currentSession'] = {
        token: 'token',
        refreshToken: '',
        expiresAt: Date.now(),
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor',
        },
        rememberMe: true,
      };

      await expect(authService.refreshToken()).rejects.toThrow(
        'No hay token de actualización disponible'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when logged in', async () => {
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
      await authService.login('A012345', 'demo123', true);

      expect(authService.getCurrentUser()).toEqual(mockResponse.user);
    });

    it('should return null when not logged in', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('getCurrentToken', () => {
    it('should return current token when logged in', async () => {
      const mockResponse = {
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        user: {
          id: 'A012345',
          nombre: 'Juan Pérez',
          rol: 'asesor' as const,
        },
      };

      (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
      await authService.login('A012345', 'demo123', true);

      expect(authService.getCurrentToken()).toBe('mock-token');
    });

    it('should return null when not logged in', () => {
      expect(authService.getCurrentToken()).toBeNull();
    });
  });
});
