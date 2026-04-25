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
