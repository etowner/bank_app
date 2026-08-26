import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen())

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers())

// Close server after all tests
afterAll(() => server.close())

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    // addEventListener: vi.fn(),
    // removeEventListener: vi.fn(),
    // dispatchEvent: vi.fn(),
  })),
});