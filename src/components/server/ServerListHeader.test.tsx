import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../i18n/i18n';
import { ServerListHeader } from './ServerListHeader';

describe('ServerListHeader', () => {
  it('sorts by most players first when the column is not active', async () => {
    const onSortChange = vi.fn();
    render(<ServerListHeader sort="DISTANCE_ASC" onSortChange={onSortChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Players' }));

    expect(onSortChange).toHaveBeenCalledWith('PLAYERS_DESC');
  });

  it('flips the direction when the active column is clicked again', async () => {
    const onSortChange = vi.fn();
    render(<ServerListHeader sort="PLAYERS_DESC" onSortChange={onSortChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Players' }));

    expect(onSortChange).toHaveBeenCalledWith('PLAYERS_ASC');
  });

  it('leaves both columns inactive in the default in-game order', () => {
    render(<ServerListHeader sort="INGAME_ORDER" onSortChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Distance' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Players' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('marks only the active sort column as pressed', () => {
    render(<ServerListHeader sort="DISTANCE_DESC" onSortChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Distance' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Players' })).toHaveAttribute('aria-pressed', 'false');
  });
});
