// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Node 25 exposes a native `localStorage` on globalThis that lacks the standard
// Storage methods (setItem, getItem, clear, removeItem, length, key).
// Vitest's populateGlobal does not override it with jsdom's implementation
// because Node's localStorage already exists on globalThis.
// Patch it here with a spec-compliant in-memory Storage implementation.
// localStorage polyfill for Node 25.x environments where a partial native
// localStorage global exists but lacks the Storage methods. This polyfill
// only covers the documented Storage API (setItem/getItem/removeItem/clear/
// length/key) — it does NOT support bracket-property access (localStorage.foo)
// or `instanceof Storage`. All project tests must use the Storage API directly.
// ⚠️ GLOBAL JSDOM LAYOUT SHIM — affects every test in the suite.
//
// jsdom returns 0 for all element dimensions, which breaks
// @tanstack/react-virtual (it computes 0 visible items and renders
// nothing, so List.test.jsx never sees server rows). The shim below
// returns synthetic non-zero values so the virtualizer behaves like a
// real browser.
//
// Side effect: any test that asserts on real layout (size/position) will
// see these synthetic values, not the actual computed layout. If a future
// test needs real layout, scope this shim to a beforeEach inside
// List.test.jsx instead of the global setup. When @tanstack/react-virtual
// is no longer used (or the project moves to a non-jsdom test env), this
// block can be deleted entirely.
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 800 });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 800 });
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: function () {
    return { width: 800, height: 800, top: 0, left: 0, right: 800, bottom: 800, x: 0, y: 0, toJSON: () => {} };
  },
});

// jsdom does not implement window.matchMedia at all. Provide a no-op stub so
// that vi.spyOn(window, 'matchMedia') works in tests that mock it (e.g.
// useMediaQuery.test.jsx). Individual tests override this via mockImplementation.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query) => ({
      media: query,
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
}

if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
    const store = {};
    const storage = {
        get length() { return Object.keys(store).length; },
        key(index) { return Object.keys(store)[index] ?? null; },
        getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
        setItem(key, value) { store[key] = String(value); },
        removeItem(key) { delete store[key]; },
        clear() { Object.keys(store).forEach(k => delete store[k]); },
    };
    Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true, configurable: true });
}
