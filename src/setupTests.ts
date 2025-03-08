// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import ResizeObserverMock from './tests/__mocks__/resizeObserver';

// Mock ResizeObserver con nuestra implementación mejorada
window.ResizeObserver = ResizeObserverMock;

// Mock matchMedia with a more robust implementation
interface MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
  addListener: (callback: (e: MediaQueryListEvent) => void) => void;
  removeListener: (callback: (e: MediaQueryListEvent) => void) => void;
  addEventListener: (type: string, callback: (e: MediaQueryListEvent) => void) => void;
  removeEventListener: (type: string, callback: (e: MediaQueryListEvent) => void) => void;
  dispatchEvent: (event: Event) => boolean;
}

const createMatchMedia = (matches: boolean): MediaQueryList => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(() => true),
});

let currentMatches = false;

const matchMedia = (query: string): MediaQueryList => {
  return createMatchMedia(query === '(prefers-color-scheme: dark)' ? currentMatches : false);
};

// Use configurable property descriptor
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: jest.fn(matchMedia),
});

// Add helper to change system theme preference in tests
window.__setPrefersDarkMode = (prefersDark: boolean) => {
  currentMatches = prefersDark;
  // Update the mock implementation instead of redefining the property
  window.matchMedia.mockImplementation((query: string) => 
    createMatchMedia(query === '(prefers-color-scheme: dark)' ? prefersDark : false)
  );
};

// Mock localStorage with a properly scoped implementation
const createLocalStorageMock = () => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] ?? null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
      // Disparar evento storage para simular cambios
      if (typeof window !== 'undefined') {
        const event = new StorageEvent('storage', {
          key,
          newValue: value,
          oldValue: store[key],
          url: window.location.href,
          storageArea: null // No necesitamos esto en los tests
        });
        window.dispatchEvent(event);
      }
    },
    removeItem(key: string): void {
      const oldValue = store[key];
      delete store[key];
      // Disparar evento storage para simular eliminación
      if (typeof window !== 'undefined') {
        const event = new StorageEvent('storage', {
          key,
          newValue: null,
          oldValue,
          url: window.location.href,
          storageArea: null
        });
        window.dispatchEvent(event);
      }
    },
    clear(): void {
      store = {};
      // Disparar evento storage para simular limpieza
      if (typeof window !== 'undefined') {
        const event = new StorageEvent('storage', {
          key: null,
          newValue: null,
          oldValue: null,
          url: window.location.href,
          storageArea: null
        });
        window.dispatchEvent(event);
      }
    },
    key(index: number): string | null {
      return Object.keys(store)[index] || null;
    },
    get length(): number {
      return Object.keys(store).length;
    }
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createLocalStorageMock(),
  writable: true,
  configurable: true
});
