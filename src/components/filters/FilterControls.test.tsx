import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import store from '../../store';
import i18n from '../../i18n/i18n';
import { DEFAULT_FILTER } from '../../lib/filters/filterSchema';

vi.mock('../../lib/api/countries', () => ({
  getCountryListAPI: vi.fn().mockResolvedValue({ data: ['KR', 'US'] }),
}));

import { FilterControls } from './FilterControls';

afterEach(() => act(() => i18n.changeLanguage('en-US')));

describe('FilterControls country names', () => {
  it('renames the country options when the language changes', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={() => {}} />
      </Provider>
    );

    await user.click(screen.getByRole('combobox'));
    await screen.findByText('South Korea');

    await act(() => i18n.changeLanguage('ko-KR'));

    expect(await screen.findByText('대한민국')).toBeInTheDocument();
  });
});

describe('FilterControls sort selector', () => {
  it('marks the current sort as checked', () => {
    render(
      <Provider store={store}>
        <FilterControls value={{ ...DEFAULT_FILTER, sort: 'PLAYERS_ASC' }} onChange={() => {}} />
      </Provider>
    );
    expect(screen.getByRole('radio', { name: 'Fewest players' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Nearest first' })).not.toBeChecked();
  });

  it('emits a sort patch when an option is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={onChange} />
      </Provider>
    );

    await user.click(screen.getByRole('radio', { name: 'Most players' }));

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTER, sort: 'PLAYERS_DESC' });
  });
});

describe('FilterControls country selector', () => {
  it('renders the country label', async () => {
    render(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={() => {}} />
      </Provider>
    );
    expect(await screen.findByText('Country')).toBeInTheDocument();
  });

  it('emits a countryFilter patch when a country is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={onChange} />
      </Provider>
    );

    // Open the popover via the combobox trigger
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);

    // Wait for the country options to appear
    await waitFor(() => expect(screen.getByText(/South Korea|Korea/)).toBeInTheDocument());

    // Click an option
    await user.click(screen.getByText(/South Korea|Korea/));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ countryFilter: ['KR'] })
    );
  });
});

function renderControls(value = DEFAULT_FILTER) {
  const onChange = vi.fn();
  render(
    <Provider store={store}>
      <FilterControls value={value} onChange={onChange} />
    </Provider>
  );
  return onChange;
}

describe('FilterControls search', () => {
  it('commits once after typing pauses, not on every keystroke', async () => {
    const user = userEvent.setup();
    const onChange = renderControls();

    await user.type(screen.getByRole('searchbox'), 'site');

    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTER, search: 'site' });
  });

  it('commits at once on Enter', async () => {
    const user = userEvent.setup();
    const onChange = renderControls();

    await user.type(screen.getByRole('searchbox'), 'site{Enter}');

    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTER, search: 'site' });
  });
});

describe('FilterControls player and slot ranges', () => {
  it('commits a minimum when the field loses focus', async () => {
    const user = userEvent.setup();
    const onChange = renderControls();

    await user.type(screen.getByRole('textbox', { name: 'Players: Min' }), '5');
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTER, players: { min: 5, max: null } });
  });

  it('keeps only digits', async () => {
    const user = userEvent.setup();
    renderControls();
    const max = screen.getByRole('textbox', { name: 'Server slots: Max' });

    await user.type(max, '4a-0');

    expect(max).toHaveValue('40');
  });

  it('swaps a minimum above its maximum', async () => {
    const user = userEvent.setup();
    const onChange = renderControls();

    await user.type(screen.getByRole('textbox', { name: 'Server slots: Min' }), '40');
    await user.type(screen.getByRole('textbox', { name: 'Server slots: Max' }), '20');
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTER, slots: { min: 20, max: 40 } });
    expect(screen.getByRole('textbox', { name: 'Server slots: Min' })).toHaveValue('20');
    expect(screen.getByRole('textbox', { name: 'Server slots: Max' })).toHaveValue('40');
  });

  it('shows the number it applied', async () => {
    const user = userEvent.setup();
    const onChange = renderControls();
    const min = screen.getByRole('textbox', { name: 'Players: Min' });

    await user.type(min, '05');
    await user.tab();
    expect(min).toHaveValue('5');

    await user.clear(min);
    await user.type(min, '0');
    await user.tab();
    expect(min).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith(DEFAULT_FILTER);
  });

  it('sets a minimum from a preset and clears it when pressed again', async () => {
    const user = userEvent.setup();
    const onChange = renderControls({ ...DEFAULT_FILTER, players: { min: 10, max: null } });

    expect(screen.getByRole('button', { name: '10+' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Players: Min' })).toHaveValue('10');

    await user.click(screen.getByRole('button', { name: '5+' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_FILTER, players: { min: 5, max: null } });

    await user.click(screen.getByRole('button', { name: '10+' }));
    expect(onChange).toHaveBeenLastCalledWith(DEFAULT_FILTER);
  });

  it('follows a range cleared from outside', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Provider store={store}>
        <FilterControls value={{ ...DEFAULT_FILTER, players: { min: 5, max: 20 } }} onChange={onChange} />
      </Provider>
    );
    expect(screen.getByRole('textbox', { name: 'Players: Max' })).toHaveValue('20');

    rerender(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={onChange} />
      </Provider>
    );

    expect(screen.getByRole('textbox', { name: 'Players: Min' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Players: Max' })).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('no longer has a separate box for hiding empty servers', () => {
    renderControls();

    expect(screen.queryByRole('checkbox', { name: /empty/i })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Hide full servers' })).toBeInTheDocument();
  });
});
