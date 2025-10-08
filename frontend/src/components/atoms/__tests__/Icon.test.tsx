import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders Material icon with name', () => {
    render(<Icon name="check_circle" />);
    expect(screen.getByText('check_circle')).toBeInTheDocument();
  });

  it('renders custom SVG icon', () => {
    render(
      <Icon ariaLabel="Custom icon">
        <svg data-testid="custom-svg">
          <path />
        </svg>
      </Icon>
    );
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
  });

  it('applies size correctly', () => {
    render(<Icon name="info" size="lg" />);
    const icon = screen.getByText('info');
    expect(icon).toHaveStyle({ fontSize: '32px' });
  });

  it('applies numeric size correctly', () => {
    render(<Icon name="info" size={40} />);
    const icon = screen.getByText('info');
    expect(icon).toHaveStyle({ fontSize: '40px' });
  });

  it('applies color correctly', () => {
    render(<Icon name="error" color="error" />);
    const icon = screen.getByText('error');
    expect(icon).toHaveStyle({ color: '#D8262C' });
  });

  it('applies custom color', () => {
    render(<Icon name="sync" color="#FF0000" />);
    const icon = screen.getByText('sync');
    expect(icon).toHaveStyle({ color: '#FF0000' });
  });

  it('has aria-label when provided', () => {
    render(<Icon name="info" ariaLabel="Información" />);
    expect(screen.getByLabelText('Información')).toBeInTheDocument();
  });

  it('has role="img" when aria-label is provided', () => {
    render(<Icon name="info" ariaLabel="Información" />);
    const icon = screen.getByLabelText('Información');
    expect(icon).toHaveAttribute('role', 'img');
  });

  it('is hidden from screen readers when ariaHidden is true', () => {
    render(<Icon name="star" ariaHidden />);
    const icon = screen.getByText('star');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Icon name="close" onClick={handleClick} />);
    fireEvent.click(screen.getByText('close'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies className correctly', () => {
    render(<Icon name="check" className="custom-class" />);
    const icon = screen.getByText('check');
    expect(icon).toHaveClass('material-icons');
    expect(icon).toHaveClass('custom-class');
  });

  it('defaults to md size when size is not provided', () => {
    render(<Icon name="check" />);
    const icon = screen.getByText('check');
    expect(icon).toHaveStyle({ fontSize: '24px' });
  });

  it('defaults to inherit color when color is not provided', () => {
    render(<Icon name="check" />);
    const icon = screen.getByText('check');
    expect(icon).toHaveStyle({ color: 'inherit' });
  });

  it('renders custom SVG with correct size', () => {
    const { container } = render(
      <Icon size="lg">
        <svg data-testid="custom-svg">
          <path />
        </svg>
      </Icon>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('renders custom SVG with correct color', () => {
    const { container } = render(
      <Icon color="primary">
        <svg data-testid="custom-svg">
          <path />
        </svg>
      </Icon>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ color: '#0A7D2B' });
  });
});
