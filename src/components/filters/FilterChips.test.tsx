import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../i18n/i18n';
import { DEFAULT_FILTER } from './filterSchema';
import { FilterChips } from './FilterChips';

describe('FilterChips sort chip', () => {
  it('renders nothing for the default sort', () => {
    const { container } = render(<FilterChips value={DEFAULT_FILTER} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('labels the distance sort now that it is no longer the default', () => {
    render(<FilterChips value={{ ...DEFAULT_FILTER, sort: 'DISTANCE_ASC' }} onChange={() => {}} />);
    expect(screen.getByText('Sort by: Nearest first')).toBeInTheDocument();
  });

  it('shows a non-default sort and clears it back to the default', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterChips value={{ ...DEFAULT_FILTER, sort: 'PLAYERS_DESC' }} onChange={onChange} />);

    expect(screen.getByText('Sort by: Most players')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filter' }));

    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTER);
  });
});
