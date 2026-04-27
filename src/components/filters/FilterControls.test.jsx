import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';
import { DEFAULT_FILTER } from './filterSchema';

vi.mock('../../lib/api/countries', () => ({
  getCountryListAPI: vi.fn().mockResolvedValue({ data: ['KR', 'US'] }),
}));

import { FilterControls } from './FilterControls';

describe('FilterControls country selector', () => {
  it('renders the country label', () => {
    render(
      <Provider store={store}>
        <FilterControls value={DEFAULT_FILTER} onChange={() => {}} />
      </Provider>
    );
    expect(screen.getByText('Country')).toBeInTheDocument();
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
