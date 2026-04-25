import { render } from '@testing-library/react';
import App from './App';
import { Provider } from 'react-redux';
import store from '../store';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en-US' }
  })
}));

test('renders without crashing', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
});
