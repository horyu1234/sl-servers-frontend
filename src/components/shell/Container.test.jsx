import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';      // initialize i18next so t() returns real strings
import i18n from '../../i18n/i18n';
import Container from './Container';

describe('Container (shell)', () => {
  it('renders TopMenu navigation links and the embedded view', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Container view={<div data-testid="page-body">page</div>}/>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId('page-body')).toBeInTheDocument();

    // Verify a translated label is actually rendered — guards against a future
    // regression where t() silently returns raw keys.
    const expectedLabel = i18n.t('navbar.server-list');
    expect(expectedLabel).not.toBe('navbar.server-list');
    expect(screen.getByRole('link', { name: new RegExp(expectedLabel, 'i') })).toBeInTheDocument();
  });
});
