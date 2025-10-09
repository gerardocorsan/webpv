import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Setup mocks before all tests
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock navigator.onLine (needs to be configurable for tests)
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    configurable: true,
    value: true,
  });

  // Mock Service Worker
  Object.defineProperty(window.navigator, 'serviceWorker', {
    writable: true,
    configurable: true,
    value: {
      register: vi.fn().mockResolvedValue({
        scope: '/',
        active: {},
        installing: null,
        waiting: null,
        update: vi.fn(),
        unregister: vi.fn(),
      }),
      ready: Promise.resolve({
        scope: '/',
        active: {},
        installing: null,
        waiting: null,
        update: vi.fn(),
        unregister: vi.fn(),
      }),
      controller: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  });

  // Mock Geolocation API
  Object.defineProperty(window.navigator, 'geolocation', {
    writable: true,
    configurable: true,
    value: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();

  // Reset navigator.onLine to default
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    configurable: true,
    value: true,
  });
});
