import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../i18n/i18n';
import { DEFAULT_FILTER } from '../../lib/filters/filterSchema';
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

describe('FilterChips ranges', () => {
  it('shows each range as one chip and clears it on its own', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value = { ...DEFAULT_FILTER, players: { min: 5, max: null }, slots: { min: 20, max: 40 } };
    render(<FilterChips value={value} onChange={onChange} />);

    expect(screen.getByText('Players: 5+')).toBeInTheDocument();
    expect(screen.getByText('Server slots: 20–40')).toBeInTheDocument();

    const playersChip = screen.getByText('Players: 5+').closest('div')!;
    await user.click(within(playersChip).getByRole('button', { name: 'Clear filter' }));

    expect(onChange).toHaveBeenCalledWith({ ...value, players: DEFAULT_FILTER.players });
  });
});
