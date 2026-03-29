import '@testing-library/jest-dom';
import ResizeObserverMock from './tests/__mocks__/resizeObserver';
import { vi } from 'vitest';

window.ResizeObserver = ResizeObserverMock;

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
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(() => true),
});

let currentMatches = false;

const matchMedia = (query: string): MediaQueryList => {
  return createMatchMedia(query === '(prefers-color-scheme: dark)' ? currentMatches : false);
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn(matchMedia),
});

window.__setPrefersDarkMode = (prefersDark: boolean) => {
  currentMatches = prefersDark;
  window.matchMedia.mockImplementation((query: string) => 
    createMatchMedia(query === '(prefers-color-scheme: dark)' ? prefersDark : false)
  );
};

const createLocalStorageMock = () => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] ?? null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
      if (typeof window !== 'undefined') {
        const event = new StorageEvent('storage', {
          key,
          newValue: value,
          oldValue: store[key],
          url: window.location.href,
          storageArea: null
        });
        window.dispatchEvent(event);
      }
    },
    removeItem(key: string): void {
      const oldValue = store[key];
      delete store[key];
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

declare global {
  interface Window {
    __setPrefersDarkMode: (prefersDark: boolean) => void;
  }
}
