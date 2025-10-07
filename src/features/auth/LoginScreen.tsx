import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { authService } from '@/services/auth';
import { AuthError } from '@/services/api/types';
import { logger } from '@/utils/logger';
import { tokens } from '@/styles/tokens';

export function LoginScreen() {
  const navigate = useNavigate();

  // Form state
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ id?: string; password?: string }>({});

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.restoreSession();
      if (user) {
        logger.info('User already authenticated, redirecting to sync');
        navigate('/sync', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError('');
    setFieldErrors({});

    // Client-side validation
    const errors: { id?: string; password?: string } = {};

    if (!id.trim()) {
      errors.id = 'El ID es requerido';
    } else if (!/^[A-Za-z0-9]{6,10}$/.test(id)) {
      errors.id = 'El ID debe tener entre 6 y 10 caracteres alfanuméricos';
    }

    if (!password.trim()) {
      errors.password = 'La contraseña es requerida';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Attempt login
    setIsLoading(true);

    try {
      logger.info('Login attempt', { id });
      const user = await authService.login(id, password, rememberMe);
      logger.info('Login successful', { userId: user.id, rol: user.rol });

      // Redirect to sync screen
      navigate('/sync', { replace: true });
    } catch (err) {
      logger.error('Login failed', { id, error: (err as Error).message });

      if (err instanceof AuthError) {
        // Handle specific error types
        if (err.details && (err.details.id || err.details.password)) {
          setFieldErrors(err.details);
        } else {
          setError(err.userMessage);
        }
      } else {
        setError('Error inesperado. Intente nuevamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.secondary,
    padding: tokens.spacing['4'],
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: tokens.shadows.lg,
    padding: tokens.spacing['8'],
    width: '100%',
    maxWidth: '400px',
  };

  const titleStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing['2'],
    textAlign: 'center',
  };

  const subtitleStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing['8'],
    textAlign: 'center',
  };

  const formStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing['4'],
  };

  const checkboxContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing['2'],
  };

  const checkboxLabelStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    cursor: 'pointer',
    userSelect: 'none',
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={titleStyles}>webpv</h1>
        <p style={subtitleStyles}>Inteligencia en Punto de Venta</p>

        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={formStyles}>
          <FormField
            label="ID de asesor"
            required
            error={fieldErrors.id}
            inputProps={{
              type: 'text',
              value: id,
              onChange: (value) => {
                setId(value);
                if (fieldErrors.id) {
                  setFieldErrors((prev) => ({ ...prev, id: undefined }));
                }
              },
              placeholder: 'A012345',
              autoComplete: 'username',
              autoFocus: true,
              disabled: isLoading,
            }}
          />

          <FormField
            label="Contraseña"
            required
            error={fieldErrors.password}
            inputProps={{
              type: 'password',
              value: password,
              onChange: (value) => {
                setPassword(value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              },
              placeholder: '••••••••',
              autoComplete: 'current-password',
              showPasswordToggle: true,
              disabled: isLoading,
            }}
          />

          <div style={checkboxContainerStyles}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
            />
            <label htmlFor="rememberMe" style={checkboxLabelStyles}>
              Recordar sesión
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={isLoading || !id.trim() || !password.trim()}
          >
            {isLoading ? 'Iniciando sesión...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
