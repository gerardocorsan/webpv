import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders label and input', () => {
    render(
      <FormField label="Username" inputProps={{ type: 'text', value: '', onChange: () => {} }} />
    );
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('shows required asterisk', () => {
    render(
      <FormField
        label="Username"
        required
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(
      <FormField
        label="Email"
        helperText="Opcional"
        inputProps={{ type: 'email', value: '', onChange: () => {} }}
      />
    );
    expect(screen.getByText('Opcional')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <FormField
        label="Password"
        error="La contraseña es requerida"
        inputProps={{ type: 'password', value: '', onChange: () => {}, hasError: true }}
      />
    );
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('La contraseña es requerida');
  });

  it('error message replaces helper text', () => {
    render(
      <FormField
        label="Username"
        helperText="Enter your username"
        error="Username is required"
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.queryByText('Enter your username')).not.toBeInTheDocument();
  });

  it('links error message with aria-describedby', () => {
    render(
      <FormField
        label="Username"
        error="Requerido"
        inputProps={{ type: 'text', value: '', onChange: () => {}, hasError: true }}
      />
    );
    const input = screen.getByLabelText('Username');
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent('Requerido');
  });

  it('links helper text with aria-describedby when no error', () => {
    render(
      <FormField
        label="Username"
        helperText="Enter your username"
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    const input = screen.getByLabelText('Username');
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBeTruthy();
    expect(document.getElementById(helperId!)).toHaveTextContent('Enter your username');
  });

  it('sets aria-required on input when required', () => {
    render(
      <FormField
        label="Username"
        required
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    const input = screen.getByLabelText(/Username/);
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('sets aria-invalid on input when error exists', () => {
    render(
      <FormField
        label="Username"
        error="Required"
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('connects label and input with htmlFor and id', () => {
    render(
      <FormField label="Username" inputProps={{ type: 'text', value: '', onChange: () => {} }} />
    );
    const input = screen.getByLabelText('Username');
    const inputId = input.getAttribute('id');
    expect(inputId).toBeTruthy();

    const label = screen.getByText('Username').closest('label');
    expect(label).toHaveAttribute('for', inputId);
  });

  it('passes input props to Input component', () => {
    const handleChange = vi.fn();
    render(
      <FormField
        label="Test"
        inputProps={{
          type: 'email',
          value: 'test@example.com',
          onChange: handleChange,
          placeholder: 'Enter email',
        }}
      />
    );
    const input = screen.getByLabelText('Test') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.value).toBe('test@example.com');
    expect(input.placeholder).toBe('Enter email');
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormField
        label="Test"
        className="custom-field"
        inputProps={{ type: 'text', value: '', onChange: () => {} }}
      />
    );
    expect(container.firstChild).toHaveClass('custom-field');
  });
});
