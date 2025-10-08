import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';
import { Icon } from '../Icon';

describe('Input', () => {
  it('renders with value', () => {
    render(<Input value="test" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledWith('new value', expect.any(Object));
  });

  it('shows password toggle for password type', () => {
    render(<Input type="password" value="" onChange={() => {}} showPasswordToggle />);
    expect(screen.getByLabelText('Mostrar contraseña')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<Input type="password" value="secret" onChange={() => {}} showPasswordToggle />);

    const input = screen.getByDisplayValue('secret') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggle = screen.getByLabelText('Mostrar contraseña');
    fireEvent.click(toggle);

    expect(input.type).toBe('text');
    expect(screen.getByLabelText('Ocultar contraseña')).toBeInTheDocument();
  });

  it('does not show password toggle when showPasswordToggle is false', () => {
    render(
      <Input type="password" value="secret" onChange={() => {}} showPasswordToggle={false} />
    );
    expect(screen.queryByLabelText('Mostrar contraseña')).not.toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input value="" onChange={() => {}} hasError />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input value="" onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('respects maxLength', () => {
    render(<Input value="test" onChange={() => {}} maxLength={5} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '5');
  });

  it('renders with placeholder', () => {
    render(<Input value="" onChange={() => {}} placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with startIcon', () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        startIcon={<Icon name="search" ariaHidden />}
      />
    );
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('renders with endIcon', () => {
    render(
      <Input
        value=""
        onChange={() => {}}
        endIcon={<Icon name="info" ariaHidden />}
      />
    );
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('calls onFocus when focused', () => {
    const handleFocus = vi.fn();
    render(<Input value="" onChange={() => {}} onFocus={handleFocus} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur when blurred', () => {
    const handleBlur = vi.fn();
    render(<Input value="" onChange={() => {}} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('has aria-label when provided', () => {
    render(<Input value="" onChange={() => {}} ariaLabel="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('has aria-describedby when provided', () => {
    render(<Input value="" onChange={() => {}} ariaDescribedBy="helper-text" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'helper-text');
  });

  it('has aria-required when required', () => {
    render(<Input value="" onChange={() => {}} required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('applies correct type attribute', () => {
    render(<Input type="email" value="" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('applies inputMode attribute', () => {
    render(<Input value="" onChange={() => {}} inputMode="numeric" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('applies name attribute', () => {
    render(<Input value="" onChange={() => {}} name="username" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'username');
  });

  it('applies autoComplete attribute', () => {
    render(<Input value="" onChange={() => {}} autoComplete="username" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'username');
  });

  it('is readOnly when readOnly prop is true', () => {
    render(<Input value="readonly value" onChange={() => {}} readOnly />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
  });

  it('has minimum font size of 16px', () => {
    const { container } = render(<Input value="" onChange={() => {}} />);
    const input = container.querySelector('input');
    // Verify minimum font size to prevent iOS zoom
    expect(input).toHaveStyle({ fontSize: '16px' });
  });
});
