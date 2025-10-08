import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Icon } from '../Icon';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    );
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Click
      </Button>
    );
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('has correct aria-label', () => {
    render(<Button ariaLabel="Submit form">Save</Button>);
    expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
  });

  it('applies secondary variant styles', () => {
    const { container } = render(<Button variant="secondary">Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({
      backgroundColor: '#FFFFFF',
      color: '#0A7D2B',
    });
  });

  it('applies primary variant styles by default', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({
      backgroundColor: '#0A7D2B',
      color: '#FFFFFF',
    });
  });

  it('renders with full width', () => {
    const { container } = render(<Button fullWidth>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({ width: '100%' });
  });

  it('renders with startIcon', () => {
    render(
      <Button startIcon={<Icon name="sync" ariaHidden />}>
        Sincronizar
      </Button>
    );
    expect(screen.getByText('sync')).toBeInTheDocument();
    expect(screen.getByText('Sincronizar')).toBeInTheDocument();
  });

  it('renders with endIcon', () => {
    render(
      <Button endIcon={<Icon name="arrow_forward" ariaHidden />}>
        Siguiente
      </Button>
    );
    expect(screen.getByText('arrow_forward')).toBeInTheDocument();
    expect(screen.getByText('Siguiente')).toBeInTheDocument();
  });

  it('hides startIcon when loading', () => {
    render(
      <Button loading startIcon={<Icon name="save" ariaHidden />}>
        Guardar
      </Button>
    );
    expect(screen.queryByText('save')).not.toBeInTheDocument();
    expect(screen.getByText('sync')).toBeInTheDocument(); // Loading spinner
  });

  it('has correct button type', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByText('Submit')).toHaveAttribute('type', 'submit');
  });

  it('defaults to button type', () => {
    render(<Button>Click</Button>);
    expect(screen.getByText('Click')).toHaveAttribute('type', 'button');
  });

  it('applies small size styles', () => {
    const { container } = render(<Button size="small">Small</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({
      height: '36px',
      minHeight: '48px',
    });
  });

  it('applies medium size styles by default', () => {
    const { container } = render(<Button>Medium</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({
      height: '48px',
    });
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click</Button>);
    expect(screen.getByText('Click')).toHaveClass('custom-class');
  });

  it('has aria-disabled when disabled', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText('Click')).toHaveAttribute('aria-disabled', 'true');
  });

  it('has disabled attribute when loading', () => {
    render(<Button loading>Click</Button>);
    expect(screen.getByText('Click')).toBeDisabled();
  });

  it('shows wait cursor when loading', () => {
    const { container } = render(<Button loading>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({ cursor: 'wait' });
  });

  it('shows not-allowed cursor when disabled', () => {
    const { container } = render(<Button disabled>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveStyle({ cursor: 'not-allowed' });
  });
});
