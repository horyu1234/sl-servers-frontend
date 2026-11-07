import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import store from '../../store';
import i18n from '../../i18n/i18n';
import { DEFAULT_FILTER } from './filterSchema';

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
