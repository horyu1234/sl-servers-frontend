import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ServerSparkline } from './ServerSparkline';

describe('ServerSparkline', () => {
  it('renders an svg with at least one path when given data', () => {
    const { container } = render(<ServerSparkline data={[0,1,2,3,4,5]} capacity={10} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(1);
  });
  it('renders the "new" state when data is null', () => {
    const { getByText } = render(<ServerSparkline data={null} capacity={10} />);
    expect(getByText(/new/i)).toBeInTheDocument();
  });
  it('renders an em dash when data is an empty array', () => {
    const { getByText } = render(<ServerSparkline data={[]} capacity={10} />);
    expect(getByText('—')).toBeInTheDocument();
  });
  it('treats null buckets as zero in the polyline (does not crash)', () => {
    const { container } = render(<ServerSparkline data={[null,1,null,3]} capacity={10} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
  it('renders peak/avg/delta on a single row when compact', () => {
    const { container } = render(<ServerSparkline data={[1,2,3,4]} compact />);
    const summary = container.querySelector('[data-testid="sparkline-summary"]');
    expect(summary).not.toBeNull();
    expect(summary.getAttribute('data-compact')).toBe('true');
  });
});
