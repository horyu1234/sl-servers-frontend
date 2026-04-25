import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
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
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
