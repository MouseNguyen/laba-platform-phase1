// Mock for isomorphic-dompurify in E2E tests
// This bypasses the ESM module issue with jsdom/parse5

export default {
  sanitize: (dirty: string) => dirty, // Just return the input as-is for testing
  isSupported: true,
  version: '1.0.0-mock',
  removed: [],
  setConfig: jest.fn(),
  clearConfig: jest.fn(),
  isValidAttribute: () => true,
  addHook: jest.fn(),
  removeHook: jest.fn(),
  removeHooks: jest.fn(),
  removeAllHooks: jest.fn(),
};
