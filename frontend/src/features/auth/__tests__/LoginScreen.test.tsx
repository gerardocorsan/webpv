import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginScreen } from '../LoginScreen';
import { authService } from '@/services/auth';
import { AuthError } from '@/services/api/types';

// Mock dependencies
vi.mock('@/services/auth');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper component for Router
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.restoreSession).mockResolvedValue(null);
  });

  describe('Rendering', () => {
    it('should render login form', async () => {
      render(<LoginScreen />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('webpv')).toBeInTheDocument();
        expect(screen.getByText('Inteligencia en Punto de Venta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('A012345')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
      });
    });

    it('should render "Recordar sesión" checkbox as checked by default', async () => {
      render(<LoginScreen />, { wrapper: TestWrapper });

      await waitFor(() => {
        const checkbox = screen.getByLabelText(/Recordar sesión/i) as HTMLInputElement;
        expect(checkbox).toBeInTheDocument();
        expect(checkbox.checked).toBe(true);
      });
    });

    it('should disable submit button when fields are empty', async () => {
      render(<LoginScreen />, { wrapper: TestWrapper });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Entrar/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Authentication Check on Mount', () => {
    it('should redirect to /sync if user is already authenticated', async () => {
      const mockUser = {
        id: 'A012345',
        nombre: 'Juan Pérez',
        rol: 'asesor' as const,
      };

      vi.mocked(authService.restoreSession).mockResolvedValue(mockUser);

      render(<LoginScreen />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/sync', { replace: true });
      });
    });

    it('should not redirect if no session exists', async () => {
      vi.mocked(authService.restoreSession).mockResolvedValue(null);

      render(<LoginScreen />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid ID format', async () => {
      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'invalid@');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/El ID debe tener entre 6 y 10 caracteres alfanuméricos/i)
        ).toBeInTheDocument();
      });

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should show validation error for ID too short', async () => {
      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A12');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/El ID debe tener entre 6 y 10 caracteres alfanuméricos/i)
        ).toBeInTheDocument();
      });

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should clear field error when user starts typing', async () => {
      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      // Trigger validation error
      await user.type(idInput, 'A12');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/El ID debe tener entre 6 y 10 caracteres alfanuméricos/i)
        ).toBeInTheDocument();
      });

      // Start typing again
      await user.clear(idInput);
      await user.type(idInput, 'A012345');

      await waitFor(() => {
        expect(
          screen.queryByText(/El ID debe tener entre 6 y 10 caracteres alfanuméricos/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'A012345',
        nombre: 'Juan Pérez',
        rol: 'asesor' as const,
      };

      vi.mocked(authService.login).mockResolvedValue(mockUser);

      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A012345');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith('A012345', 'demo123', true);
        expect(mockNavigate).toHaveBeenCalledWith('/sync', { replace: true });
      });
    });

    it('should show loading state during login', async () => {
      vi.mocked(authService.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A012345');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      expect(screen.getByText(/Iniciando sesión.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle login failure with field errors', async () => {
      const mockError = new AuthError('VALIDATION_ERROR', 'Error de validación', {
        id: 'ID inválido',
        password: 'Contraseña incorrecta',
      });

      vi.mocked(authService.login).mockRejectedValue(mockError);

      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A012345');
      await user.type(passwordInput, 'wrong');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ID inválido/i)).toBeInTheDocument();
        expect(screen.getByText(/Contraseña incorrecta/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle login failure with general error', async () => {
      const mockError = new AuthError('INVALID_CREDENTIALS', 'Credenciales inválidas');

      vi.mocked(authService.login).mockRejectedValue(mockError);

      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A012345');
      await user.type(passwordInput, 'wrong');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Network error'));

      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A012345');
      await user.type(passwordInput, 'demo123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Error inesperado. Intente nuevamente/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should dismiss error alert when clicking dismiss button', async () => {
      const mockError = new AuthError('INVALID_CREDENTIALS', 'Credenciales inválidas');

      vi.mocked(authService.login).mockRejectedValue(mockError);

      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A012345');
      await user.type(passwordInput, 'wrong');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
      });

      // Click dismiss button
      const dismissButton = screen.getByRole('button', { name: /Cerrar alerta/i });
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText(/Credenciales inválidas/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Remember Me Checkbox', () => {
    it('should pass rememberMe=false when unchecked', async () => {
      const mockUser = {
        id: 'A012345',
        nombre: 'Juan Pérez',
        rol: 'asesor' as const,
      };

      vi.mocked(authService.login).mockResolvedValue(mockUser);

      render(<LoginScreen />, { wrapper: TestWrapper });
      const user = userEvent.setup();

      const idInput = screen.getByPlaceholderText('A012345');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const rememberMeCheckbox = screen.getByLabelText(/Recordar sesión/i);
      const submitButton = screen.getByRole('button', { name: /Entrar/i });

      await user.type(idInput, 'A012345');
      await user.type(passwordInput, 'demo123');
      await user.click(rememberMeCheckbox); // Uncheck
      await user.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith('A012345', 'demo123', false);
      });
    });
  });
});
