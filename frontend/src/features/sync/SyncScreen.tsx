import React from 'react';
import { tokens } from '@/styles/tokens';
import { authService } from '@/services/auth';
import { Button } from '@/components/atoms/Button';
import { useNavigate } from 'react-router-dom';

export function SyncScreen() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login', { replace: true });
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
    maxWidth: '600px',
    textAlign: 'center',
  };

  const titleStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing['4'],
  };

  const textStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily.primary,
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing['6'],
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={titleStyles}>Sincronización</h1>
        <p style={textStyles}>
          Bienvenido, <strong>{user?.nombre}</strong>
        </p>
        <p style={textStyles}>
          Esta pantalla implementará la sincronización inicial de datos (US-B1).
        </p>
        <p style={{ ...textStyles, marginBottom: tokens.spacing['8'] }}>
          Por ahora, solo puedes cerrar sesión.
        </p>
        <Button variant="secondary" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
