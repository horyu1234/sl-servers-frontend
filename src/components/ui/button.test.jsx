import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button (shadcn primitive)', () => {
  it('renders with given children', () => {
    render(<Button>Press me</Button>);
    expect(screen.getByRole('button', { name: 'Press me' })).toBeInTheDocument();
  });

  it('applies variant=destructive class', () => {
    render(<Button variant="destructive">Danger</Button>);
    const btn = screen.getByRole('button', { name: 'Danger' });
    expect(btn.className).toMatch(/destructive/);
  });
});
