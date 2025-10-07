import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../Alert';
import { Icon } from '../../atoms/Icon';

describe('Alert', () => {
  it('renders with message', () => {
    render(<Alert variant="info">Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<Alert variant="info">Test</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error variant with correct styles', () => {
    const { container } = render(<Alert variant="error">Error</Alert>);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveStyle({ backgroundColor: '#FEE2E2', color: '#D8262C' });
  });

  it('shows success variant with correct styles', () => {
    const { container } = render(<Alert variant="success">Success</Alert>);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveStyle({ backgroundColor: '#D1FAE5', color: '#0A7D2B' });
  });

  it('shows warning variant with correct styles', () => {
    const { container } = render(<Alert variant="warning">Warning</Alert>);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveStyle({ backgroundColor: '#FEF3C7', color: '#F59E0B' });
  });

  it('shows info variant with correct styles', () => {
    const { container } = render(<Alert variant="info">Info</Alert>);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveStyle({ backgroundColor: '#DBEAFE', color: '#2196F3' });
  });

  it('shows icon by default', () => {
    render(<Alert variant="success">Success</Alert>);
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('shows correct default icon for error variant', () => {
    render(<Alert variant="error">Error</Alert>);
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('shows correct default icon for warning variant', () => {
    render(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('shows correct default icon for info variant', () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(
      <Alert variant="info" showIcon={false}>
        Info
      </Alert>
    );
    expect(screen.queryByText('info')).not.toBeInTheDocument();
  });

  it('shows custom icon when provided', () => {
    render(
      <Alert variant="info" icon={<Icon name="cloud_off" />}>
        Custom icon
      </Alert>
    );
    expect(screen.getByText('cloud_off')).toBeInTheDocument();
    expect(screen.queryByText('info')).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible', () => {
    render(
      <Alert variant="info" dismissible>
        Info
      </Alert>
    );
    expect(screen.getByLabelText('Cerrar alerta')).toBeInTheDocument();
  });

  it('does not show dismiss button when not dismissible', () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.queryByLabelText('Cerrar alerta')).not.toBeInTheDocument();
  });

  it('calls onDismiss when close button clicked', () => {
    const handleDismiss = vi.fn();
    render(
      <Alert variant="info" dismissible onDismiss={handleDismiss}>
        Info
      </Alert>
    );

    fireEvent.click(screen.getByLabelText('Cerrar alerta'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('has aria-live="assertive" for error variant', () => {
    render(<Alert variant="error">Error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('has aria-live="polite" for non-error variants', () => {
    const { rerender } = render(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');

    rerender(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('applies custom className', () => {
    render(
      <Alert variant="info" className="custom-class">
        Info
      </Alert>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });
});
