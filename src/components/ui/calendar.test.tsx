import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('applies the grid class through a classNames key DayPicker still supports', () => {
    render(<Calendar mode="single" defaultMonth={new Date(2026, 0, 1)} />);
    expect(screen.getByRole('grid')).toHaveClass('w-full', 'border-collapse');
  });
});
